
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

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
  res.send('SmartBrief API Server is running');
});

// Mount authentication routes
app.use('/api/auth', authRoutes);

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

