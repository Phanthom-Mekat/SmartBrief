const { summarizationQueue } = require('../config/queue');
const { getSummary } = require('../services/aiService');
const Summary = require('../models/Summary');
const User = require('../models/User');

/**
 * Process summarization jobs from the queue
 */
summarizationQueue.process(async (job) => {
  const { userId, text, options = {} } = job.data;

  try {
    console.log(`Processing summarization job ${job.id} for user ${userId}`);
    
    // Update job progress
    await job.progress(10);

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await job.progress(20);

    // Generate summary
    const startTime = Date.now();
    const summaryResult = await getSummary(text, options);
    const processingTime = Date.now() - startTime;

    await job.progress(80);

    // Handle both string and object returns from AI service
    let summaryText, isFallback = false, originalWordCount, summaryWordCount, compressionRatio;
    
    if (typeof summaryResult === 'string') {
      summaryText = summaryResult;
      // Calculate stats
      originalWordCount = text.trim().split(/\s+/).length;
      summaryWordCount = summaryText.trim().split(/\s+/).length;
      compressionRatio = originalWordCount > 0 ? summaryWordCount / originalWordCount : 0;
    } else {
      // Fallback object response
      summaryText = summaryResult.summary;
      isFallback = summaryResult.isFallback || false;
      originalWordCount = summaryResult.originalWordCount;
      summaryWordCount = summaryResult.summaryWordCount;
      compressionRatio = summaryResult.compressionRatio;
    }

    // Create summary document
    const summary = new Summary({
      user: userId,
      originalContent: text,
      summarizedContent: summaryText,
      originalWordCount,
      summaryWordCount,
      compressionRatio,
      status: 'completed',
      processingTime,
      aiModel: options.model || 'openai/gpt-oss-120b',
      isFallback,
      uploadedFileName: options.fileName || null,
      customPrompt: options.customPrompt || null
    });

    await summary.save();
    await job.progress(100);

    console.log(`✅ Summarization job ${job.id} completed successfully`);

    return {
      success: true,
      summaryId: summary._id,
      processingTime,
      compressionRatio: (compressionRatio * 100).toFixed(1) + '%'
    };

  } catch (error) {
    console.error(`❌ Summarization job ${job.id} failed:`, error);
    throw error;
  }
});

console.log('✓ Summarization worker started');

module.exports = summarizationQueue;
