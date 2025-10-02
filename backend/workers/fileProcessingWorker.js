const { fileProcessingQueue } = require('../config/queue');
const FileProcessor = require('../services/fileProcessor');
const { getSummary } = require('../services/aiService');
const Summary = require('../models/Summary');
const User = require('../models/User');
const fs = require('fs').promises;

/**
 * Process file upload and summarization jobs from the queue
 */
fileProcessingQueue.process(async (job) => {
  const { userId, filePath, fileName, options = {} } = job.data;
  let tempFilePath = filePath;

  try {
    console.log(`Processing file job ${job.id} for user ${userId}: ${fileName}`);
    
    await job.progress(10);

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has credits
    if (user.credits <= 0) {
      throw new Error('Insufficient credits');
    }

    await job.progress(20);

    // Process file to extract text
    // Create a file object that matches what FileProcessor expects
    const fileObj = {
      path: filePath,
      originalname: fileName
    };
    // Pass false to prevent auto-deletion, we'll delete it later ourselves
    const extractedText = await FileProcessor.extractTextFromFile(fileObj, false);
    
    // Validate the extracted content
    const validation = FileProcessor.validateContent(extractedText);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    await job.progress(40);

    // Generate summary
    const startTime = Date.now();
    const summaryResult = await getSummary(extractedText, options);
    const processingTime = Date.now() - startTime;

    await job.progress(70);

    // Handle both string and object returns from AI service
    let summaryText, isFallback = false, originalWordCount, summaryWordCount, compressionRatio;
    
    if (typeof summaryResult === 'string') {
      summaryText = summaryResult;
      originalWordCount = extractedText.trim().split(/\s+/).length;
      summaryWordCount = summaryText.trim().split(/\s+/).length;
      compressionRatio = originalWordCount > 0 ? summaryWordCount / originalWordCount : 0;
    } else {
      summaryText = summaryResult.summary;
      isFallback = summaryResult.isFallback || false;
      originalWordCount = summaryResult.originalWordCount;
      summaryWordCount = summaryResult.summaryWordCount;
      compressionRatio = summaryResult.compressionRatio;
    }

    // Create summary document
    const summary = new Summary({
      user: userId,
      originalContent: extractedText,
      summarizedContent: summaryText,
      originalWordCount,
      summaryWordCount,
      compressionRatio,
      status: 'completed',
      processingTime,
      aiModel: options.model || 'openai/gpt-oss-120b',
      isFallback,
      uploadedFileName: fileName,
      customPrompt: options.customPrompt || null
    });

    await summary.save();

    // Deduct credit from user
    user.credits -= 1;
    user.lastActive = new Date();
    await user.save();

    await job.progress(90);

    // Clean up temporary file
    try {
      await fs.unlink(tempFilePath);
      console.log(`✓ Temporary file deleted: ${fileName}`);
    } catch (cleanupError) {
      console.warn('Warning: Could not delete temporary file:', cleanupError.message);
    }

    await job.progress(100);

    console.log(`✅ File processing job ${job.id} completed successfully`);

    return {
      success: true,
      summaryId: summary._id,
      processingTime,
      compressionRatio: (compressionRatio * 100).toFixed(1) + '%',
      creditsRemaining: user.credits
    };

  } catch (error) {
    console.error(`❌ File processing job ${job.id} failed:`, error);
    
    // Clean up temporary file on error
    try {
      if (tempFilePath) {
        await fs.unlink(tempFilePath);
        console.log(`✓ Temporary file deleted after error: ${fileName}`);
      }
    } catch (cleanupError) {
      console.warn('Warning: Could not delete temporary file:', cleanupError.message);
    }
    
    throw error;
  }
});

console.log('✓ File Processing worker started');

module.exports = fileProcessingQueue;
