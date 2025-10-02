/**
 * Worker process entry point
 * This file starts all background workers
 * Run with: node workers/index.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// Import all workers
require('./summarizationWorker');
require('./fileProcessingWorker');
require('./emailWorker');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB connected for workers');
    console.log('✓ All workers are running and waiting for jobs...');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down workers...');
  await mongoose.connection.close();
  console.log('✓ MongoDB connection closed');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('===============================================');
console.log('🚀 Background Workers Started');
console.log('===============================================');
console.log('Workers listening on queues:');
console.log('  - Summarization Queue');
console.log('  - File Processing Queue');
console.log('  - Email Queue');
console.log('===============================================');
