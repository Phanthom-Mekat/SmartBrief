
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { initializeRedis, closeRedis } = require('./config/redisClient');
const { serverAdapter } = require('./config/queue');
const { startCronJobs, stopCronJobs } = require('./services/cronService');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/testRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminSummaryRoutes = require('./routes/adminSummaryRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for large content
app.use(cors({
  origin: ['http://localhost:5173'], 
  credentials: true,
})); 
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'SmartBrief API Server is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      summaries: '/api/summaries',
      test: '/api/test'
    },
    features: ['Authentication', 'RBAC', 'AI Summarization', 'Credit System']
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/summaries', adminSummaryRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/test', testRoutes);

// Bull Board - Queue monitoring dashboard (admin only in production)
app.use('/admin/queues', serverAdapter.getRouter());

// Initialize connections
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    
    // Initialize Redis (optional - app will work without it)
    await initializeRedis();
    
    // Start cron jobs
    startCronJobs();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`SmartBrief server running on port ${PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        // Stop cron jobs
        stopCronJobs();
        
        // Close Redis connection
        await closeRedis();
        
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        
        console.log('Graceful shutdown complete');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    console.error('Server initialization error:', err);
    process.exit(1);
  }
};

// Start the server
startServer();

