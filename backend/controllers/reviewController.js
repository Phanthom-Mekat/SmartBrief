const Summary = require('../models/Summary');
const User = require('../models/User');

/**
 * @desc    Get all summaries pending review
 * @route   GET /api/reviews/pending
 * @access  Private (reviewer, editor, admin)
 */
const getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status && status !== 'all') {
      query.reviewStatus = status;
    }

    const summaries = await Summary.find(query)
      .populate('user', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Summary.countDocuments(query);

    // Get statistics
    const stats = await Summary.aggregate([
      {
        $group: {
          _id: '$reviewStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const statistics = {
      total: total,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      approved: stats.find(s => s._id === 'approved')?.count || 0,
      rejected: stats.find(s => s._id === 'rejected')?.count || 0,
      needs_revision: stats.find(s => s._id === 'needs_revision')?.count || 0
    };

    res.status(200).json({
      success: true,
      data: summaries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      statistics
    });
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending reviews',
      error: error.message
    });
  }
};

/**
 * @desc    Submit a review for a summary
 * @route   POST /api/reviews/:id/submit
 * @access  Private (reviewer, editor, admin)
 */
const submitReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comments } = req.body;
    const reviewerId = req.user._id;

    // Validate action
    const validActions = ['approved', 'rejected', 'needs_revision'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review action. Must be: approved, rejected, or needs_revision'
      });
    }

    // Find summary
    const summary = await Summary.findById(id).populate('user', 'name email');
    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    // Update review status
    summary.reviewStatus = action;
    summary.reviewedBy = reviewerId;
    summary.reviewedAt = new Date();
    summary.reviewComments = comments || null;

    // Add to review history
    summary.reviewHistory.push({
      reviewer: reviewerId,
      action: action,
      comments: comments || null,
      timestamp: new Date()
    });

    await summary.save();

    // Populate reviewer info for response
    await summary.populate('reviewedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: `Summary ${action} successfully`,
      data: {
        summaryId: summary._id,
        reviewStatus: summary.reviewStatus,
        reviewedBy: summary.reviewedBy,
        reviewedAt: summary.reviewedAt,
        reviewComments: summary.reviewComments,
        owner: summary.user
      }
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
};

/**
 * @desc    Get review history for a specific summary
 * @route   GET /api/reviews/:id/history
 * @access  Private (reviewer, editor, admin, owner)
 */
const getReviewHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await Summary.findById(id)
      .populate('user', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('reviewHistory.reviewer', 'name email role');

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    // Check access: owner can view their own, or reviewer/editor/admin can view all
    const isOwner = summary.user._id.toString() === req.user._id.toString();
    const hasReviewAccess = ['reviewer', 'editor', 'admin'].includes(req.user.role);

    if (!isOwner && !hasReviewAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view review history for your own summaries.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        summaryId: summary._id,
        owner: summary.user,
        currentStatus: summary.reviewStatus,
        reviewedBy: summary.reviewedBy,
        reviewedAt: summary.reviewedAt,
        currentComments: summary.reviewComments,
        history: summary.reviewHistory
      }
    });
  } catch (error) {
    console.error('Error fetching review history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review history',
      error: error.message
    });
  }
};

/**
 * @desc    Get reviewer dashboard statistics
 * @route   GET /api/reviews/stats
 * @access  Private (reviewer, editor, admin)
 */
const getReviewerStats = async (req, res) => {
  try {
    const reviewerId = req.user._id;

    // Get overall statistics
    const overallStats = await Summary.aggregate([
      {
        $group: {
          _id: '$reviewStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get reviewer's personal statistics
    const reviewerStats = await Summary.aggregate([
      {
        $match: { reviewedBy: reviewerId }
      },
      {
        $group: {
          _id: '$reviewStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent reviews by this reviewer
    const recentReviews = await Summary.find({ reviewedBy: reviewerId })
      .populate('user', 'name email')
      .sort({ reviewedAt: -1 })
      .limit(10);

    // Get daily review count for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyReviews = await Summary.aggregate([
      {
        $match: {
          reviewedBy: reviewerId,
          reviewedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$reviewedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const statistics = {
      overall: {
        total: overallStats.reduce((sum, item) => sum + item.count, 0),
        pending: overallStats.find(s => s._id === 'pending')?.count || 0,
        approved: overallStats.find(s => s._id === 'approved')?.count || 0,
        rejected: overallStats.find(s => s._id === 'rejected')?.count || 0,
        needs_revision: overallStats.find(s => s._id === 'needs_revision')?.count || 0
      },
      myReviews: {
        total: reviewerStats.reduce((sum, item) => sum + item.count, 0),
        approved: reviewerStats.find(s => s._id === 'approved')?.count || 0,
        rejected: reviewerStats.find(s => s._id === 'rejected')?.count || 0,
        needs_revision: reviewerStats.find(s => s._id === 'needs_revision')?.count || 0
      },
      recentActivity: recentReviews.map(r => ({
        id: r._id,
        owner: r.user,
        status: r.reviewStatus,
        reviewedAt: r.reviewedAt,
        comments: r.reviewComments
      })),
      dailyReviews: dailyReviews
    };

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching reviewer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviewer statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk update review status
 * @route   POST /api/reviews/bulk-update
 * @access  Private (admin only)
 */
const bulkUpdateReviews = async (req, res) => {
  try {
    const { summaryIds, action, comments } = req.body;
    const reviewerId = req.user._id;

    if (!Array.isArray(summaryIds) || summaryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'summaryIds must be a non-empty array'
      });
    }

    const validActions = ['approved', 'rejected', 'needs_revision'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    const updateData = {
      reviewStatus: action,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewComments: comments || null,
      $push: {
        reviewHistory: {
          reviewer: reviewerId,
          action: action,
          comments: comments || null,
          timestamp: new Date()
        }
      }
    };

    const result = await Summary.updateMany(
      { _id: { $in: summaryIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} summaries updated successfully`,
      data: {
        updated: result.modifiedCount,
        action: action
      }
    });
  } catch (error) {
    console.error('Error bulk updating reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update reviews',
      error: error.message
    });
  }
};

module.exports = {
  getPendingReviews,
  submitReview,
  getReviewHistory,
  getReviewerStats,
  bulkUpdateReviews
};
