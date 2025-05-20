// file: middleware/upload.js
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB file size limit
  },
  // Add error handling
  onError: function(err, next) {
    console.log('Multer error:', err);
    next(err);
  }
});

module.exports = { upload };