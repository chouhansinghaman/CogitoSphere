// middleware/uploadMiddleware.js

import multer from "multer";

// Use memory storage to handle files as buffers, which is Vercel-friendly
const storage = multer.memoryStorage();

// Filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB file size limit
});

// Middleware to be used in routes
export const uploadSingleImage = upload.single("avatar");