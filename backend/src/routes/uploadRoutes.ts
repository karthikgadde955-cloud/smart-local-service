import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload';
import { AppError } from '../utils/appError';

const router = Router();

router.post('/', upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      fileUrl,
    },
  });
});

export default router;
