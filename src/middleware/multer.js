const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    // Set destination folder
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    // Set filename
    filename: (req, file, cb) => {

        // Or generate unique name
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

module.exports = upload;