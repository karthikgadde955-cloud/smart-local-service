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

// API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/services', serviceRoutes);
app.use('/providers', providerRoutes);
app.use('/ai', aiRoutes);
app.use('/appliances', applianceRoutes);
app.use('/emergency', emergencyRoutes);
app.use('/bookings', bookingRoutes);
app.use('/reviews', reviewRoutes);
app.use('/upload', uploadRoutes);

// Fallback to web app for index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../web_app/index.html'));
});

// Central Error Handler
app.use(errorHandler);

export default app;
