const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

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

// Create queues
const summarizationQueue = new Queue('summarization', redisConfig);
const fileProcessingQueue = new Queue('file-processing', redisConfig);
const emailQueue = new Queue('email', redisConfig);

// Setup Bull Board for monitoring
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullAdapter(summarizationQueue),
    new BullAdapter(fileProcessingQueue),
    new BullAdapter(emailQueue)
  ],
  serverAdapter
});

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

// Setup listeners for all queues
setupQueueListeners(summarizationQueue, 'Summarization');
setupQueueListeners(fileProcessingQueue, 'File Processing');
setupQueueListeners(emailQueue, 'Email');

// Graceful shutdown
const closeQueues = async () => {
  console.log('Closing job queues...');
  await Promise.all([
    summarizationQueue.close(),
    fileProcessingQueue.close(),
    emailQueue.close()
  ]);
  console.log('✓ All queues closed');
};

process.on('SIGTERM', closeQueues);
process.on('SIGINT', closeQueues);

module.exports = {
  summarizationQueue,
  fileProcessingQueue,
  emailQueue,
  serverAdapter,
  closeQueues
};
