const { summarizationQueue, fileProcessingQueue, emailQueue } = require('../config/queue');

/**
 * Queue Service - Helper functions to add jobs to queues
 * Note: Queues are disabled in serverless environments
 */

/**
 * Check if queues are available
 */
const areQueuesAvailable = () => {
  return summarizationQueue !== null && fileProcessingQueue !== null && emailQueue !== null;
};

/**
 * Add a summarization job to the queue
 * @param {Object} jobData - Job data
 * @param {string} jobData.userId - User ID
 * @param {string} jobData.text - Text to summarize
 * @param {Object} jobData.options - Options for summarization
 * @returns {Promise<Object>} - Job object
 */
const addSummarizationJob = async (userId, text, options = {}) => {
  if (!areQueuesAvailable()) {
    throw new Error('Queue service is not available. Async operations are disabled in serverless mode. Use synchronous endpoints instead.');
  }

  try {
    const job = await summarizationQueue.add(
      {
        userId,
        text,
        options
      },
      {
        attempts: 3, // Retry up to 3 times on failure
        backoff: {
          type: 'exponential',
          delay: 2000 // Start with 2 second delay
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50 // Keep last 50 failed jobs
      }
    );

    console.log(`✓ Summarization job ${job.id} added to queue for user ${userId}`);
    return job;
  } catch (error) {
    console.error('Error adding summarization job to queue:', error);
    throw error;
  }
};

/**
 * Add a file processing job to the queue
 * @param {Object} jobData - Job data
 * @param {string} jobData.userId - User ID
 * @param {string} jobData.filePath - Path to uploaded file
 * @param {string} jobData.fileName - Original filename
 * @param {Object} jobData.options - Options for summarization
 * @returns {Promise<Object>} - Job object
 */
const addFileProcessingJob = async (userId, filePath, fileName, options = {}) => {
  if (!areQueuesAvailable()) {
    throw new Error('Queue service is not available. Async operations are disabled in serverless mode. Use synchronous endpoints instead.');
  }

  try {
    const job = await fileProcessingQueue.add(
      {
        userId,
        filePath,
        fileName,
        options
      },
      {
        attempts: 2, // Retry once on failure
        backoff: {
          type: 'exponential',
          delay: 3000
        },
        removeOnComplete: 100,
        removeOnFail: 50,
        timeout: 300000 // 5 minute timeout for file processing
      }
    );

    console.log(`✓ File processing job ${job.id} added to queue for user ${userId}: ${fileName}`);
    return job;
  } catch (error) {
    console.error('Error adding file processing job to queue:', error);
    throw error;
  }
};

/**
 * Add an email job to the queue
 * @param {Object} emailData - Email data
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.body - Email body
 * @param {string} emailData.type - Email type (welcome, notification, etc.)
 * @returns {Promise<Object>} - Job object
 */
const addEmailJob = async (to, subject, body, type = 'notification') => {
  if (!areQueuesAvailable()) {
    throw new Error('Queue service is not available. Async operations are disabled in serverless mode.');
  }

  try {
    const job = await emailQueue.add(
      {
        to,
        subject,
        body,
        type
      },
      {
        attempts: 5, // Email can retry multiple times
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: 200,
        removeOnFail: 100
      }
    );

    console.log(`✓ Email job ${job.id} added to queue for ${to}`);
    return job;
  } catch (error) {
    console.error('Error adding email job to queue:', error);
    throw error;
  }
};

/**
 * Get job status by ID
 * @param {string} queueName - Queue name (summarization, file-processing, email)
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} - Job status
 */
const getJobStatus = async (queueName, jobId) => {
  if (!areQueuesAvailable()) {
    throw new Error('Queue service is not available. Async operations are disabled in serverless mode.');
  }

  try {
    let queue;
    switch (queueName) {
      case 'summarization':
        queue = summarizationQueue;
        break;
      case 'file-processing':
        queue = fileProcessingQueue;
        break;
      case 'email':
        queue = emailQueue;
        break;
      default:
        throw new Error('Invalid queue name');
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      id: job.id,
      status: state,
      progress,
      result,
      failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn
    };
  } catch (error) {
    console.error('Error getting job status:', error);
    throw error;
  }
};

/**
 * Get queue statistics
 * @param {string} queueName - Queue name
 * @returns {Promise<Object>} - Queue stats
 */
const getQueueStats = async (queueName) => {
  if (!areQueuesAvailable()) {
    throw new Error('Queue service is not available. Async operations are disabled in serverless mode.');
  }

  try {
    let queue;
    switch (queueName) {
      case 'summarization':
        queue = summarizationQueue;
        break;
      case 'file-processing':
        queue = fileProcessingQueue;
        break;
      case 'email':
        queue = emailQueue;
        break;
      default:
        throw new Error('Invalid queue name');
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ]);

    return {
      queue: queueName,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    throw error;
  }
};

module.exports = {
  areQueuesAvailable,
  addSummarizationJob,
  addFileProcessingJob,
  addEmailJob,
  getJobStatus,
  getQueueStats
};
