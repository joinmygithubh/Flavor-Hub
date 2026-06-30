import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import { env } from './config/env.js';
import { sendSuccess } from './utils/apiResponse.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import dishRoutes from './routes/dishRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

/**
 * Builds and configures the Express application. Kept separate from server.js so
 * it can be imported by tests without binding to a port.
 */
export const createApp = () => {
  const app = express();

  // Trust the first proxy (needed for correct client IPs behind a load balancer,
  // which rate-limiting relies on).
  app.set('trust proxy', 1);

  // --- Security headers ---
  app.use(helmet());

  // --- CORS: only allow the configured client origin(s), not "*" ---
  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser tools (curl/Postman) that send no origin.
        if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );

  // --- Body parsing (with a sane size limit) ---
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // --- Sanitize against NoSQL operator injection ($gt, etc.) in inputs ---
  app.use(mongoSanitize());

  // --- Gzip responses ---
  app.use(compression());

  // --- Request logging (concise in prod, verbose in dev) ---
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // --- Global rate limiter ---
  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMs,
      max: env.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests, please slow down', data: null },
    })
  );

  // --- Health check ---
  app.get('/api/health', (req, res) =>
    sendSuccess(res, { message: 'Flavor Hub API is healthy', data: { uptime: process.uptime() } })
  );

  // --- Feature routes ---
  app.use('/api/auth', authRoutes);
  app.use('/api/dishes', dishRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);

  // --- 404 + centralized error handling (must be last) ---
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
