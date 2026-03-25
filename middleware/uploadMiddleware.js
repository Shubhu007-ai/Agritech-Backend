const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ✅ Allowed MIME types
const allowedMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/x-matroska"
];

// ✅ Allowed extensions
const allowedExtensions = [".mp4", ".webm", ".mkv"];

const path = require("path");

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeValid = allowedMimeTypes.includes(file.mimetype);
  const isExtValid = allowedExtensions.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    cb(
      new Error("Only MP4, WEBM, and MKV video files are allowed."),
      false
    );
  }
};

// ✅ Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    resource_type: "video", // 🔥 IMPORTANT for videos
  },
});

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});