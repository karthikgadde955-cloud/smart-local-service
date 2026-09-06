import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/appError';

// TODO: Production Media Storage Notice
// Serverless platforms (e.g. Vercel Functions) feature ephemeral read-only file systems (except /tmp).
// For production deployments, media uploads must be migrated to cloud object storage (e.g., Vercel Blob, AWS S3, or Cloudinary).
// For local development, disk storage is maintained with safe fallback to /tmp in serverless environments.

const uploadDir = process.env.VERCEL === '1'
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '../../uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ Warning: Unable to create media upload directory on disk:', err);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image (JPEG, PNG, WEBP) and video (MP4, MOV) files are supported.', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});
