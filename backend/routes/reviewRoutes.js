const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPendingReviews,
  submitReview,
  getReviewHistory,
  getReviewerStats,
  bulkUpdateReviews
} = require('../controllers/reviewController');

/**
 * Review Routes
 * All routes require authentication and reviewer/editor/admin role
 */

/**
 * @route   GET /api/reviews/pending
 * @desc    Get all summaries for review (with filtering by status)
 * @access  Private (reviewer, editor, admin)
 * @query   page, limit, status (pending/approved/rejected/needs_revision/all)
 */
router.get('/pending', protect, authorize('admin', 'editor', 'reviewer'), getPendingReviews);

/**
 * @route   GET /api/reviews/stats
 * @desc    Get reviewer dashboard statistics
 * @access  Private (reviewer, editor, admin)
 */
router.get('/stats', protect, authorize('admin', 'editor', 'reviewer'), getReviewerStats);

/**
 * @route   POST /api/reviews/:id/submit
 * @desc    Submit a review for a summary (approve/reject/needs_revision)
 * @access  Private (reviewer, editor, admin)
 * @body    { action: 'approved|rejected|needs_revision', comments: 'optional feedback' }
 */
router.post('/:id/submit', protect, authorize('admin', 'editor', 'reviewer'), submitReview);

/**
 * @route   GET /api/reviews/:id/history
 * @desc    Get review history for a specific summary
 * @access  Private (owner, reviewer, editor, admin)
 */
router.get('/:id/history', protect, getReviewHistory);

/**
 * @route   POST /api/reviews/bulk-update
 * @desc    Bulk update review status for multiple summaries
 * @access  Private (admin only)
 * @body    { summaryIds: [], action: 'approved|rejected|needs_revision', comments: 'optional' }
 */
router.post('/bulk-update', protect, authorize('admin'), bulkUpdateReviews);

module.exports = router;
