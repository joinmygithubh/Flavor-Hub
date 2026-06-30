import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Establishes a single, reused connection to MongoDB Atlas.
 * Mongoose maintains an internal connection pool, so we connect once at boot.
 */
export const connectDB = async () => {
  // Fail with a clear, actionable message instead of a cryptic Mongoose error
  // when the connection string is missing (the #1 first-run gotcha).
  if (!env.mongoUri) {
    throw new Error(
      'MONGO_URI is not set. Create a `.env` file in the `server/` folder ' +
        '(copy `.env.example`) and set MONGO_URI to your MongoDB connection string.'
    );
  }

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
