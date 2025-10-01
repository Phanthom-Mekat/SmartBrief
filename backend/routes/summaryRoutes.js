const express = require('express');
const router = express.Router();
const { protect, checkCredits } = require('../middleware/authMiddleware');
const {
  createSummary,
  getUserSummaries,
  getSummaryById,
  deleteSummary
} = require('../controllers/summaryController');

/**
 * @route   POST /api/summaries
 * @desc    Create a new AI-generated summary
 * @access  Private (requires authentication and 1 credit)
 */
router.post('/', protect, checkCredits(1), createSummary);

/**
 * @route   GET /api/summaries
 * @desc    Get all summaries for the authenticated user (with pagination)
 * @access  Private
 */
router.get('/', protect, getUserSummaries);

/**
 * @route   GET /api/summaries/:id
 * @desc    Get a specific summary by ID
 * @access  Private (user can only access their own summaries)
 */
router.get('/:id', protect, getSummaryById);

/**
 * @route   DELETE /api/summaries/:id
 * @desc    Delete a specific summary
 * @access  Private (user can only delete their own summaries)
 */
router.delete('/:id', protect, deleteSummary);

module.exports = router;