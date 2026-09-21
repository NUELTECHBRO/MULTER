const multer = require('multer');
const cloudinary = require('cloudinary').v2;

require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = {
    _handleFile: (req, file, cb) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: 'xtp-courses',
            resource_type: 'auto',
        }, (error, result) => {
            if (error) {
                return cb(error);
            }

            cb(null, {
                filename: result.public_id,
                path: result.secure_url,
                size: result.bytes,
                public_id: result.public_id,
                resource_type: result.resource_type,
            });
        });

        file.stream.pipe(uploadStream);
    },

    _removeFile: (req, file, cb) => {
        if (!file.public_id) {
            return cb(null);
        }

        cloudinary.uploader.destroy(file.public_id, {
            resource_type: file.resource_type || 'image',
        }, cb);
    },
};

const upload = multer({ storage });

module.exports = upload;