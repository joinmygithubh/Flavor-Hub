import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Establishes a single, reused connection to MongoDB Atlas.
 * Mongoose maintains an internal connection pool, so we connect once at boot.
 */
export const connectDB = async () => {
  // `strictQuery` avoids silently ignoring unknown query fields.
  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(env.mongoUri, {
    // Sensible timeouts so a bad URI fails fast instead of hanging.
    serverSelectionTimeoutMS: 10000,
  });

  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${conn.connection.host}`);

  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err.message);
  });

  return conn;
};
