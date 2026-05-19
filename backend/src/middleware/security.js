const rateLimit = require('express-rate-limit');

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again later.',
});

const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 6,
  message: 'Too many password reset attempts. Please try again later.',
});

const uploadLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many uploads in a short time. Please wait and try again.',
});

module.exports = {
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
};
