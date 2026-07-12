import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initComplianceOverdueJob } from './jobs/complianceOverdue.job';
import { initChallengeReminderJob } from './jobs/challengeReminder.job';
import mongoose from 'mongoose';

const startServer = async () => {
  await connectDB();
  
  // Initialize scheduled jobs
  initComplianceOverdueJob();
  initChallengeReminderJob();
  
  const port = env.PORT || 5000;
  
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Frontend CORS allowed for: ${env.VITE_FRONTEND_URL}`);
  });

  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB disconnect:', err);
        process.exit(1);
      }
    });

    // Forced shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();
