import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { openapiSpec } from './docs/openapi.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import ApiError from './utils/ApiError.js';

export function createApp(config) {
  const app = express();
  app.locals.config = config;
  const allowedOrigins = config.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new ApiError(403, 'Origin is not allowed by CORS'));
  } }));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  if (config.NODE_ENV !== 'test') app.use(morgan('combined', { skip: (req) => req.path === '/health' }));
  app.get('/health', (_req, res) => res.json({ success: true, message: 'TaskFlow API is healthy' }));
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/tasks', taskRoutes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.get('/openapi.json', (_req, res) => res.json(openapiSpec));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
