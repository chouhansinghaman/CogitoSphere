import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage to stream files directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'course-pdfs', // Folder name in your Cloudinary account
    resource_type: 'auto', // Let Cloudinary detect the file type
    allowed_formats: ['pdf'], // Restrict uploads to only PDF files
    public_id: (req, file) => `pdf-${Date.now()}-${file.originalname}`, // Create a unique file name
  },
});

// Create the multer upload instance
const upload = multer({ storage: storage });

export { cloudinary, upload };