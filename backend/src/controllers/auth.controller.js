const crypto = require('crypto');
const { matchedData } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const createToken = require('../utils/createToken');
const User = require('../models/User');

const authResponse = (user) => ({
  token: createToken(user),
  user,
});

const shouldExposeResetToken = process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_RESET_TOKENS === 'true';

const findByIdentifier = (identifier) => {
  const normalized = String(identifier).trim().toLowerCase();
  return User.findOne({
    $or: [{ email: normalized }, { mobile: identifier }, { username: normalized }],
  }).select('+password');
};

const register = asyncHandler(async (req, res) => {
  const data = matchedData(req);

  if (!data.email && !data.mobile) {
    throw new ApiError(422, 'Email or mobile number is required.');
  }

  const user = await User.create({
    username: data.username,
    fullName: data.fullName,
    email: data.email,
    mobile: data.mobile,
    password: data.password,
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: authResponse(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = matchedData(req);
  const user = await findByIdentifier(identifier);

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid login credentials.');
  }

  if (user.isBlocked || user.isDeleted) {
    throw new ApiError(403, 'This account is not active.');
  }

  res.json({
    success: true,
    message: 'Logged in successfully.',
    data: authResponse(user),
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = matchedData(req);
  const user = await findByIdentifier(identifier);

  if (!user) {
    return res.json({
      success: true,
      message: 'If an account exists, a reset link will be sent.',
    });
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'If an account exists, a reset link will be sent.',
    data: shouldExposeResetToken ? { resetToken } : undefined,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = matchedData(req);
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    throw new ApiError(400, 'Reset token is invalid or expired.');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully.',
    data: authResponse(user),
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

const setupProfile = asyncHandler(async (req, res) => {
  const allowed = ['avatar', 'bio', 'website', 'fullName', 'username', 'isPrivate'];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  req.user.profileSetupCompleted = true;
  await req.user.save();

  res.json({
    success: true,
    message: 'Profile setup completed.',
    data: req.user,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = matchedData(req);
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully.',
  });
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  setupProfile,
  changePassword,
};
