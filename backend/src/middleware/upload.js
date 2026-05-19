const multer = require('multer');
const ApiError = require('../utils/apiError');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
    return cb(new ApiError(422, 'Only image and video files are supported.'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});

module.exports = upload;
