const multer = require("multer");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const cloudinaryConfig = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
];

const missingConfig = cloudinaryConfig.filter((key) => !process.env[key]);

if (missingConfig.length > 0) {
    throw new Error(
        `Missing Cloudinary configuration: ${missingConfig.join(", ")}`
    );
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 600000
});

const storage = {

    _handleFile: (req, file, cb) => {

        const isVideo = file.mimetype && file.mimetype.startsWith("video/");
        let finished = false;

        const finish = (error, result) => {
            if (finished) {
                return;
            }

            finished = true;
            cb(error, result);
        };

        let uploadStream;

        if (isVideo) {

            // Large video upload using Cloudinary chunked upload
            uploadStream = cloudinary.uploader.upload_chunked_stream(
                {
                    folder: "xtp-courses",
                    resource_type: "video",
                    chunk_size: 20 * 1024 * 1024,
                    timeout: 600000
                },
                (error, result) => {
                    if (error) {
                        console.error(
                            "Cloudinary video upload error:",
                            error
                        );

                        return finish(error);
                    }

                    finish(null, {
                        filename: result.public_id,
                        path: result.secure_url,
                        size: result.bytes,
                        public_id: result.public_id,
                        resource_type: result.resource_type
                    });
                }
            );

        } else {

            // Thumbnail/image upload
            uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "xtp-courses",
                    resource_type: "image"
                },
                (error, result) => {
                    if (error) {
                        console.error(
                            "Cloudinary image upload error:",
                            error
                        );

                        return finish(error);
                    }

                    finish(null, {
                        filename: result.public_id,
                        path: result.secure_url,
                        size: result.bytes,
                        public_id: result.public_id,
                        resource_type: result.resource_type
                    });
                }
            );
        }

        file.stream.on("error", finish);
        uploadStream.on("error", finish);
        file.stream.pipe(uploadStream);
    },


    _removeFile: (req, file, cb) => {

        if (!file.public_id) {
            return cb(null);
        }

        cloudinary.uploader.destroy(
            file.public_id,
            {
                resource_type: file.resource_type || "image"
            },
            cb
        );
    }
};


const upload = multer({
    storage,

    fileFilter: (req, file, cb) => {
        const isVideo = file.mimetype && file.mimetype.startsWith("video/");
        const isImage = file.mimetype && file.mimetype.startsWith("image/");
        const validField =
            (file.fieldname === "video" && isVideo) ||
            (file.fieldname === "thumbnail" && isImage);

        if (validField) {
            return cb(null, true);
        }

        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    },

    limits: {
        fileSize: 1024 * 1024 * 1024,
        files: 2
    }
});


module.exports = upload;