
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/testRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
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
      test: '/api/test'
    }
  });
});

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount test routes for RBAC testing
app.use('/api/test', testRoutes);

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected successfully');
  // Start server only after DB connection
  app.listen(PORT, () => {
    console.log(`SmartBrief server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

