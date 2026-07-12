import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { setupSwagger } from './config/swagger';
import { loggerMiddleware } from './utils/logger';

const app = express();

// Secure headers with sensible CSP configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

// Apply input sanitization against NoSQL injection
const sanitizeNoSQL = (obj: any) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitizeNoSQL(obj[key]);
      }
    }
  }
};

app.use((req, res, next) => {
  sanitizeNoSQL(req.body);
  sanitizeNoSQL(req.params);
  next();
});

// Structured logging with request-id context
app.use(loggerMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder as static
app.use('/uploads', express.static('uploads'));

app.use(cors({
  origin: env.VITE_FRONTEND_URL,
  credentials: true,
}));

// Rate limiting: 100 requests per minute per IP for auth routes
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    message: 'Too many requests on authentication endpoints, please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth', authRateLimiter);

// Health check route reflecting MongoDB connection status
app.get('/health', (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState;
  let statusText = 'unknown';
  switch (dbStatus) {
    case 0: statusText = 'disconnected'; break;
    case 1: statusText = 'connected'; break;
    case 2: statusText = 'connecting'; break;
    case 3: statusText = 'disconnecting'; break;
  }

  const isHealthy = dbStatus === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: {
      status: statusText,
      code: dbStatus
    }
  });
});

// Routes mounting
app.use('/api/v1', routes);

// Setup Swagger API docs
setupSwagger(app);

app.use(errorHandler);

export default app;
