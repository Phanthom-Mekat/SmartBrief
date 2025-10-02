const Summary = require('../models/Summary');
const User = require('../models/User');

/**
 * @desc    Get ALL summaries (Admin & Reviewer can view all, Editor can edit all)
 * @route   GET /api/admin/summaries
 * @access  Private (admin, editor, reviewer)
 */
const getAllSummaries = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query filter
    const filter = {};
    if (userId) {
      filter.user = userId;
    }
    if (search) {
      filter.$or = [
        { originalContent: { $regex: search, $options: 'i' } },
        { summarizedContent: { $regex: search, $options: 'i' } }
      ];
    }

    // Get summaries with user information
    const summaries = await Summary.find(filter)
      .populate('user', 'name email role credits')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Summary.countDocuments(filter);

    // Calculate statistics
    const statistics = await Summary.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSummaries: { $sum: 1 },
          totalWords: { $sum: '$originalWordCount' },
          totalSummaryWords: { $sum: '$summaryWordCount' },
          averageCompressionRatio: { $avg: '$compressionRatio' },
          averageProcessingTime: { $avg: '$processingTime' }
        }
      }
    ]);

    // Get summaries by user count
    const summariesByUser = await Summary.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          userName: '$userInfo.name',
          userEmail: '$userInfo.email',
          userRole: '$userInfo.role',
          summaryCount: '$count'
        }
      },
      { $sort: { summaryCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      message: 'All summaries retrieved successfully',
      data: {
        summaries,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        },
        statistics: statistics[0] || {
          totalSummaries: 0,
          totalWords: 0,
          totalSummaryWords: 0,
          averageCompressionRatio: 0,
          averageProcessingTime: 0
        },
        topUsers: summariesByUser
      }
    });

  } catch (error) {
    console.error('Get all summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving summaries',
      error: error.message
    });
  }
};

/**
 * @desc    Get a specific summary by ID (any user's summary)
 * @route   GET /api/admin/summaries/:id
 * @access  Private (admin, editor, reviewer)
 */
const getSummaryByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await Summary.findById(id)
      .populate('user', 'name email role credits')
      .lean();

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Summary retrieved successfully',
      data: { summary }
    });

  } catch (error) {
    console.error('Get summary by ID (admin) error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving summary',
      error: error.message
    });
  }
};

/**
 * @desc    Update a summary (Editor & Admin only)
 * @route   PUT /api/admin/summaries/:id
 * @access  Private (admin, editor)
 */
const updateSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { summarizedContent } = req.body;

    if (!summarizedContent || summarizedContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Summarized content is required'
      });
    }

    const summary = await Summary.findById(id);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    // Update the summary
    summary.summarizedContent = summarizedContent;
    summary.summaryWordCount = summarizedContent.split(/\s+/).filter(word => word.length > 0).length;
    summary.compressionRatio = summary.originalWordCount > 0 
      ? (summary.summaryWordCount / summary.originalWordCount).toFixed(2)
      : 0;

    await summary.save();

    // Populate user info for response
    await summary.populate('user', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Summary updated successfully',
      data: { summary }
    });

    console.log(`User ${req.user.name} (${req.user.role}) updated summary ${summary._id}`);

  } catch (error) {
    console.error('Update summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating summary',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a summary (Editor & Admin only)
 * @route   DELETE /api/admin/summaries/:id
 * @access  Private (admin, editor)
 */
const deleteSummaryAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await Summary.findByIdAndDelete(id);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
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

    console.log(`User ${req.user.name} (${req.user.role}) deleted summary ${summary._id}`);

  } catch (error) {
    console.error('Delete summary (admin) error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting summary',
      error: error.message
    });
  }
};

/**
 * @desc    Get summary statistics
 * @route   GET /api/admin/summaries/stats
 * @access  Private (admin only)
 */
const getSummaryStatistics = async (req, res) => {
  try {
    // Overall statistics
    const overallStats = await Summary.aggregate([
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

    // Summaries per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const summariesPerDay = await Summary.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Summaries by user role
    const summariesByRole = await Summary.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $group: {
          _id: '$userInfo.role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top users by summary count
    const topUsers = await Summary.aggregate([
      {
        $group: {
          _id: '$user',
          summaryCount: { $sum: 1 },
          totalWords: { $sum: '$originalWordCount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          userName: '$userInfo.name',
          userEmail: '$userInfo.email',
          userRole: '$userInfo.role',
          summaryCount: 1,
          totalWords: 1
        }
      },
      { $sort: { summaryCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Summary statistics retrieved successfully',
      data: {
        overall: overallStats[0] || {
          totalSummaries: 0,
          totalOriginalWords: 0,
          totalSummaryWords: 0,
          averageCompressionRatio: 0,
          averageProcessingTime: 0
        },
        summariesPerDay,
        summariesByRole,
        topUsers
      }
    });

  } catch (error) {
    console.error('Get summary statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllSummaries,
  getSummaryByIdAdmin,
  updateSummary,
  deleteSummaryAdmin,
  getSummaryStatistics
};
