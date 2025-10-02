
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/testRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminSummaryRoutes = require('./routes/adminSummaryRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for large content
app.use(cors({
  origin: ['http://localhost:5173', 'https://aismartbrief.vercel.app'], 
  credentials: true,
})); 
app.use(cookieParser());

// MongoDB connection with caching for serverless
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedDb;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedDb = conn;
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Middleware to ensure DB connection before each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message 
    });
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'SmartBrief API Server is running',
    version: '1.0.0',
    deployment: 'Vercel Serverless',
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    await connectDB();
    console.log(`SmartBrief server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;

