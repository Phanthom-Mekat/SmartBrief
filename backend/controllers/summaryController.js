const Summary = require('../models/Summary');
const User = require('../models/User');
const { getSummary, validateContent } = require('../services/aiService');
const { setCache, isRedisConnected } = require('../config/redisClient');
const FileProcessor = require('../services/fileProcessor');

/**
 * @desc    Create a new summary
 * @route   POST /api/summaries
 * @access  Private (requires authentication and 1 credit)
 */
const createSummary = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { content } = req.body;
    const userId = req.user._id;

    // Validate input content
    const validation = validateContent(content);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content provided',
        errors: validation.errors
      });
    }

    // Double-check user credits (middleware should have already checked)
    const user = await User.findById(userId);
    if (!user || user.credits < 1) {
      return res.status(402).json({
        success: false,
        message: 'Insufficient credits to create summary'
      });
    }

    console.log(`Starting summarization for user ${user.name} (${user.email})`);

    // Generate summary using AI service
    let summarizedContent;
    let summaryStats = {};
    try {
      const result = await getSummary(content);
      
      // Handle both string and object returns (for fallback)
      if (typeof result === 'string') {
        summarizedContent = result;
      } else if (result && typeof result === 'object') {
        // Fallback summary returns an object with stats
        summarizedContent = result.summary;
        summaryStats = {
          originalWordCount: result.originalWordCount,
          summaryWordCount: result.summaryWordCount,
          compressionRatio: result.compressionRatio
        };
      }
    } catch (aiError) {
      console.error('AI summarization failed:', aiError.message);
      return res.status(503).json({
        success: false,
        message: 'AI summarization service is currently unavailable',
        error: aiError.message
      });
    }

    // Create new summary document
    const summary = new Summary({
      user: userId,
      originalContent: content,
      summarizedContent,
      processingTime: Date.now() - startTime,
      ...summaryStats  // Include pre-calculated stats if available
    });

    // Save summary to database
    await summary.save();

    // Deduct 1 credit from user
    user.credits -= 1;
    await user.save();

    console.log(`Summary created successfully for user ${user.name}. Credits remaining: ${user.credits}`);

    // Prepare response data
    const summaryData = {
      id: summary._id,
      originalWordCount: summary.originalWordCount,
      summaryWordCount: summary.summaryWordCount,
      compressionRatio: summary.compressionRatio,
      summarizedContent: summary.summarizedContent,
      processingTime: summary.processingTime,
      createdAt: summary.createdAt,
      aiModel: summary.aiModel,
      status: summary.status
    };

    // Cache the result if Redis is connected and cache key is available
    if (isRedisConnected() && req.cacheKey) {
      const cacheSuccess = await setCache(
        req.cacheKey,
        summaryData,
        86400 // 24 hours in seconds
      );
      
      if (cacheSuccess) {
        console.log(`✓ Summary cached with key: ${req.cacheKey.substring(0, 40)}...`);
      } else {
        console.warn('⚠ Failed to cache summary result');
      }
    }

    // Return success response with summary data
    res.status(201).json({
      success: true,
      message: 'Summary created successfully',
      fromCache: false,
      data: {
        summary: summaryData,
        user: {
          creditsRemaining: user.credits,
          creditsUsed: 1
        },
        statistics: summary.statistics
      }
    });

  } catch (error) {
    console.error('Create summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating summary',
      error: error.message
    });
  }
};

/**
 * @desc    Get all summaries for the authenticated user
 * @route   GET /api/summaries
 * @access  Private
 */
const getUserSummaries = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user summaries with pagination
    const summaries = await Summary.find({ user: userId })
      .select('-originalContent') // Exclude original content for performance
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalSummaries = await Summary.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalSummaries / limit);

    // Calculate user statistics
    const userStats = await Summary.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalSummaries: { $sum: 1 },
          totalOriginalWords: { $sum: '$originalWordCount' },
          totalSummaryWords: { $sum: '$summaryWordCount' },
          averageCompressionRatio: { $avg: '$compressionRatio' },
          averageProcessingTime: { $avg: '$processingTime' }
        }
      }
    ]);

    const statistics = userStats[0] || {
      totalSummaries: 0,
      totalOriginalWords: 0,
      totalSummaryWords: 0,
      averageCompressionRatio: 0,
      averageProcessingTime: 0
    };

    res.status(200).json({
      success: true,
      message: 'Summaries retrieved successfully',
      data: {
        summaries,
        pagination: {
          currentPage: page,
          totalPages,
          totalSummaries,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        statistics: {
          ...statistics,
          wordsReduced: statistics.totalOriginalWords - statistics.totalSummaryWords,
          averageCompressionPercentage: ((1 - statistics.averageCompressionRatio) * 100).toFixed(1) + '%'
        }
      }
    });

  } catch (error) {
    console.error('Get user summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving summaries',
      error: error.message
    });
  }
};

/**
 * @desc    Get a specific summary by ID
 * @route   GET /api/summaries/:id
 * @access  Private
 */
const getSummaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const summary = await Summary.findOne({ 
      _id: id, 
      user: userId 
    }).populate('user', 'name email');

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Summary retrieved successfully',
      data: {
        summary: {
          id: summary._id,
          originalContent: summary.originalContent,
          summarizedContent: summary.summarizedContent,
          originalWordCount: summary.originalWordCount,
          summaryWordCount: summary.summaryWordCount,
          compressionRatio: summary.compressionRatio,
          processingTime: summary.processingTime,
          aiModel: summary.aiModel,
          createdAt: summary.createdAt,
          updatedAt: summary.updatedAt
        },
        statistics: summary.statistics
      }
    });

  } catch (error) {
    console.error('Get summary by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving summary',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a summary
 * @route   DELETE /api/summaries/:id
 * @access  Private
 */
const deleteSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const summary = await Summary.findOneAndDelete({ 
      _id: id, 
      user: userId 
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Summary deleted successfully',
      data: {
        deletedSummary: {
          id: summary._id,
          createdAt: summary.createdAt
        }
      }
    });

    console.log(`User ${req.user.name} deleted summary ${summary._id}`);

  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting summary',
      error: error.message
    });
  }
};

/**
 * @desc    Create summary from uploaded file
 * @route   POST /api/summaries/upload
 * @access  Private (requires authentication and 1 credit)
 */
const createSummaryFromFile = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const userId = req.user._id;
    const file = req.file;

    // Validate file exists
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a .txt or .docx file.'
      });
    }

    console.log(`Processing file upload: ${file.originalname} (${file.size} bytes)`);

    // Extract text content from file
    let content;
    try {
      content = await FileProcessor.extractTextFromFile(file);
    } catch (extractError) {
      console.error('File extraction error:', extractError.message);
      return res.status(400).json({
        success: false,
        message: 'Failed to extract text from file',
        error: extractError.message
      });
    }

    // Validate extracted content
    const contentValidation = FileProcessor.validateContent(content);
    if (!contentValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file content',
        error: contentValidation.error
      });
    }

    // Validate content for AI processing
    const aiValidation = validateContent(content);
    if (!aiValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content for summarization',
        errors: aiValidation.errors
      });
    }

    // Check user credits
    const user = await User.findById(userId);
    if (!user || user.credits < 1) {
      return res.status(402).json({
        success: false,
        message: 'Insufficient credits to create summary'
      });
    }

    console.log(`File processed successfully. Starting summarization for user ${user.name}`);

    // Generate summary using AI service
    let summarizedContent;
    let summaryStats = {};
    try {
      const result = await getSummary(content);
      
      if (typeof result === 'string') {
        summarizedContent = result;
      } else if (result && typeof result === 'object') {
        summarizedContent = result.summary;
        summaryStats = {
          originalWordCount: result.originalWordCount,
          summaryWordCount: result.summaryWordCount,
          compressionRatio: result.compressionRatio
        };
      }
    } catch (aiError) {
      console.error('AI summarization failed:', aiError.message);
      return res.status(503).json({
        success: false,
        message: 'AI summarization service is currently unavailable',
        error: aiError.message
      });
    }

    // Create summary document
    const summary = new Summary({
      user: userId,
      originalContent: content,
      summarizedContent,
      processingTime: Date.now() - startTime,
      uploadedFileName: file.originalname,
      ...summaryStats
    });

    await summary.save();

    // Deduct credit
    user.credits -= 1;
    await user.save();

    console.log(`Summary created from file for user ${user.name}. Credits remaining: ${user.credits}`);

    // Prepare response
    const summaryData = {
      id: summary._id,
      originalWordCount: summary.originalWordCount,
      summaryWordCount: summary.summaryWordCount,
      compressionRatio: summary.compressionRatio,
      summarizedContent: summary.summarizedContent,
      processingTime: summary.processingTime,
      uploadedFileName: summary.uploadedFileName,
      createdAt: summary.createdAt,
      aiModel: summary.aiModel,
      status: summary.status
    };

    // Cache if Redis is available
    if (isRedisConnected() && req.cacheKey) {
      await setCache(req.cacheKey, summaryData, 86400);
    }

    res.status(201).json({
      success: true,
      message: 'Summary created successfully from uploaded file',
      fromCache: false,
      data: {
        summary: summaryData,
        user: {
          creditsRemaining: user.credits,
          creditsUsed: 1
        },
        statistics: summary.statistics
      }
    });

  } catch (error) {
    console.error('Create summary from file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing file',
      error: error.message
    });
  }
};

/**
 * @desc    Regenerate summary with custom prompt
 * @route   POST /api/summaries/:id/regenerate
 * @access  Private (does not deduct credits - free regeneration)
 */
const regenerateSummary = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { customPrompt } = req.body;
    const userId = req.user._id;

    // Find the original summary
    const summary = await Summary.findOne({ _id: id, user: userId });
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found or access denied'
      });
    }

    console.log(`Regenerating summary ${id} for user ${req.user.name}`);

    // Generate new summary with custom prompt
    let summarizedContent;
    let summaryStats = {};
    
    try {
      const result = await getSummary(summary.originalContent, {
        customPrompt: customPrompt || null
      });
      
      if (typeof result === 'string') {
        summarizedContent = result;
      } else if (result && typeof result === 'object') {
        summarizedContent = result.summary;
        summaryStats = {
          originalWordCount: result.originalWordCount,
          summaryWordCount: result.summaryWordCount,
          compressionRatio: result.compressionRatio
        };
      }
    } catch (aiError) {
      console.error('AI regeneration failed:', aiError.message);
      return res.status(503).json({
        success: false,
        message: 'AI summarization service is currently unavailable',
        error: aiError.message
      });
    }

    // Update the summary
    summary.summarizedContent = summarizedContent;
    summary.customPrompt = customPrompt || null;
    summary.regenerationCount = (summary.regenerationCount || 0) + 1;
    summary.processingTime = Date.now() - startTime;
    
    // Update stats if provided
    if (Object.keys(summaryStats).length > 0) {
      Object.assign(summary, summaryStats);
    }

    await summary.save();

    console.log(`Summary regenerated successfully. Regeneration count: ${summary.regenerationCount}`);

    // Prepare response data
    const summaryData = {
      id: summary._id,
      originalWordCount: summary.originalWordCount,
      summaryWordCount: summary.summaryWordCount,
      compressionRatio: summary.compressionRatio,
      summarizedContent: summary.summarizedContent,
      customPrompt: summary.customPrompt,
      regenerationCount: summary.regenerationCount,
      processingTime: summary.processingTime,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt,
      aiModel: summary.aiModel,
      status: summary.status
    };

    res.status(200).json({
      success: true,
      message: 'Summary regenerated successfully',
      data: {
        summary: summaryData,
        statistics: summary.statistics
      }
    });

  } catch (error) {
    console.error('Regenerate summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while regenerating summary',
      error: error.message
    });
  }
};

module.exports = {
  createSummary,
  createSummaryFromFile,
  getUserSummaries,
  getSummaryById,
  deleteSummary,
  regenerateSummary
};