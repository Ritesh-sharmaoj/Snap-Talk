const stream = require('stream');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer, folder, resourceType) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });

const uploadMedia = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'Cloudinary is not configured. Add Cloudinary keys to backend/.env.');
  }

  if (!req.file) {
    throw new ApiError(422, 'A media file is required.');
  }

  const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
  const result = await uploadToCloudinary(req.file.buffer, 'snap-talk', mediaType);

  res.status(201).json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      mediaType,
    },
  });
});

module.exports = {
  uploadMedia,
};
