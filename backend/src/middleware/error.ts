import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Express Error Handler:', err);
  }

  res.status(statusCode).json({
    success: false,
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
