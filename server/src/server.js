import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

/**
 * Application entry point: connect to the database, then start the HTTP server.
 * Includes graceful shutdown and last-resort handlers for unhandled rejections.
 */
const start = async () => {
  try {
    await connectDB();

    const app = createApp();
    const server = app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Flavor Hub API running in ${env.nodeEnv} mode on port ${env.port}`);
    });

    // Crash safely on unexpected async errors rather than entering a bad state.
    process.on('unhandledRejection', (reason) => {
      // eslint-disable-next-line no-console
      console.error('Unhandled Rejection:', reason);
      server.close(() => process.exit(1));
    });

    // Graceful shutdown on container/orchestrator signals.
    const shutdown = (signal) => {
      // eslint-disable-next-line no-console
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(() => process.exit(0));
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
