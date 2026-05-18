const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const User = require('../models/User');

const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.split(' ')[1] : null;
};

const protect = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    throw new ApiError(401, 'Authentication token is required.');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'User account no longer exists.');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked.');
  }

  req.user = user;
  next();
});

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required.'));
  }

  next();
};

module.exports = {
  protect,
  requireAdmin,
};
