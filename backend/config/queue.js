const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

// Check if running in serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

let summarizationQueue = null;
let fileProcessingQueue = null;
let emailQueue = null;
let serverAdapter = null;

if (!isServerless) {
  // Create Redis connection options
  const redisConfig = {
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
    // Add retry strategy for better resilience
    settings: {
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 1000, 3000);
      }
    }
  };

  try {
    // Create queues
    summarizationQueue = new Queue('summarization', redisConfig);
    fileProcessingQueue = new Queue('file-processing', redisConfig);
    emailQueue = new Queue('email', redisConfig);

    // Setup Bull Board for monitoring
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [
        new BullAdapter(summarizationQueue),
        new BullAdapter(fileProcessingQueue),
        new BullAdapter(emailQueue)
      ],
      serverAdapter
    });
  } catch (error) {
    console.error('Failed to initialize queues:', error.message);
    console.warn('⚠ Queues disabled - async operations will not work');
  }
} else {
  console.log('⚠ Serverless environment detected - Queues disabled');
}

// Queue event listeners for logging
const setupQueueListeners = (queue, queueName) => {
  queue.on('error', (error) => {
    console.error(`❌ ${queueName} Queue Error:`, error);
  });

  queue.on('waiting', (jobId) => {
    console.log(`⏳ ${queueName} Job ${jobId} is waiting`);
  });

  queue.on('active', (job) => {
    console.log(`🔄 ${queueName} Job ${job.id} started processing`);
  });

  queue.on('completed', (job, result) => {
    console.log(`✅ ${queueName} Job ${job.id} completed`);
  });

  queue.on('failed', (job, err) => {
    console.error(`❌ ${queueName} Job ${job.id} failed:`, err.message);
  });

  queue.on('stalled', (job) => {
    console.warn(`⚠️ ${queueName} Job ${job.id} stalled`);
  });
};

// Setup listeners for all queues (only if queues are initialized)
if (summarizationQueue && fileProcessingQueue && emailQueue) {
  setupQueueListeners(summarizationQueue, 'Summarization');
  setupQueueListeners(fileProcessingQueue, 'File Processing');
  setupQueueListeners(emailQueue, 'Email');
}

// Graceful shutdown
const closeQueues = async () => {
  if (!summarizationQueue && !fileProcessingQueue && !emailQueue) {
    console.log('No queues to close');
    return;
  }
  
  console.log('Closing job queues...');
  const closePromises = [];
  
  if (summarizationQueue) closePromises.push(summarizationQueue.close());
  if (fileProcessingQueue) closePromises.push(fileProcessingQueue.close());
  if (emailQueue) closePromises.push(emailQueue.close());
  
  await Promise.all(closePromises);
  console.log('✓ All queues closed');
};

if (!isServerless) {
  process.on('SIGTERM', closeQueues);
  process.on('SIGINT', closeQueues);
}

module.exports = {
  summarizationQueue,
  fileProcessingQueue,
  emailQueue,
  serverAdapter,
  closeQueues
};
