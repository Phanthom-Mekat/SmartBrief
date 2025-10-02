const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllSummaries,
  getSummaryByIdAdmin,
  updateSummary,
  deleteSummaryAdmin,
  getSummaryStatistics
} = require('../controllers/adminSummaryController');

/**
 * Admin Summary Routes
 * Role-based access control for managing summaries across all users
 */

/**
 * @route   GET /api/admin/summaries/stats
 * @desc    Get summary statistics (admin only)
 * @access  Private (admin)
 */
router.get('/stats', protect, authorize('admin'), getSummaryStatistics);

/**
 * @route   GET /api/admin/summaries
 * @desc    Get all summaries from all users (admin, editor, reviewer can view)
 * @access  Private (admin, editor, reviewer)
 */
router.get('/', protect, authorize('admin', 'editor', 'reviewer'), getAllSummaries);

/**
 * @route   GET /api/admin/summaries/:id
 * @desc    Get a specific summary by ID (any user's summary)
 * @access  Private (admin, editor, reviewer)
 */
router.get('/:id', protect, authorize('admin', 'editor', 'reviewer'), getSummaryByIdAdmin);

/**
 * @route   PUT /api/admin/summaries/:id
 * @desc    Update a summary (admin & editor only)
 * @access  Private (admin, editor)
 */
router.put('/:id', protect, authorize('admin', 'editor'), updateSummary);

/**
 * @route   DELETE /api/admin/summaries/:id
 * @desc    Delete a summary (admin & editor only)
 * @access  Private (admin, editor)
 */
router.delete('/:id', protect, authorize('admin', 'editor'), deleteSummaryAdmin);

module.exports = router;
