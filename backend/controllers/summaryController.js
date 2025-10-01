const Summary = require('../models/Summary');
const User = require('../models/User');
const { getSummary, validateContent } = require('../services/aiService');

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
    try {
      summarizedContent = await getSummary(content);
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
      processingTime: Date.now() - startTime
    });

    // Save summary to database
    await summary.save();

    // Deduct 1 credit from user
    user.credits -= 1;
    await user.save();

    console.log(`Summary created successfully for user ${user.name}. Credits remaining: ${user.credits}`);

    // Return success response with summary data
    res.status(201).json({
      success: true,
      message: 'Summary created successfully',
      data: {
        summary: {
          id: summary._id,
          originalWordCount: summary.originalWordCount,
          summaryWordCount: summary.summaryWordCount,
          compressionRatio: summary.compressionRatio,
          summarizedContent: summary.summarizedContent,
          processingTime: summary.processingTime,
          createdAt: summary.createdAt
        },
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

module.exports = {
  createSummary,
  getUserSummaries,
  getSummaryById,
  deleteSummary
};