import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import serviceRoutes from './routes/serviceRoutes';
import providerRoutes from './routes/providerRoutes';
import aiRoutes from './routes/aiRoutes';
import applianceRoutes from './routes/applianceRoutes';
import emergencyRoutes from './routes/emergencyRoutes';
import bookingRoutes from './routes/bookingRoutes';
import reviewRoutes from './routes/reviewRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { errorHandler } from './middleware/error';

const app = express();

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use('/api', limiter);

// Serve uploads & static web dashboard
const uploadDir = process.env.VERCEL === '1'
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, '../../web_app')));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Smart Local Service API',
    time: new Date().toISOString(),
  });
});

// API Routes (Supports both /api/<route> for Vercel serverless and direct <route>)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/services', '/services'], serviceRoutes);
app.use(['/api/providers', '/providers'], providerRoutes);
app.use(['/api/ai', '/ai'], aiRoutes);
app.use(['/api/appliances', '/appliances'], applianceRoutes);
app.use(['/api/emergency', '/emergency'], emergencyRoutes);
app.use(['/api/bookings', '/bookings'], bookingRoutes);
app.use(['/api/reviews', '/reviews'], reviewRoutes);
app.use(['/api/upload', '/upload'], uploadRoutes);

// Fallback to web app for index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../web_app/index.html'));
});

// Central Error Handler
app.use(errorHandler);

export default app;
