const express = require('express');
const router = express.Router();
const { protect, checkCredits } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');
const upload = require('../config/fileUpload');
const {
  createSummary,
  createSummaryFromFile,
  getUserSummaries,
  getSummaryById,
  deleteSummary,
  regenerateSummary,
  createSummaryAsync,
  createSummaryFromFileAsync,
  getJobStatus
} = require('../controllers/summaryController');

/**
 * @route   POST /api/summaries
 * @desc    Create a new AI-generated summary
 * @access  Private (requires authentication and 1 credit)
 * @middleware  protect -> cacheMiddleware -> checkCredits(1) -> createSummary
 * 
 * Flow:
 * 1. protect: Verify JWT and attach user to request
 * 2. cacheMiddleware: Check if summary exists in Redis cache
 *    - If cache HIT: Return cached result immediately (no credit charge)
 *    - If cache MISS: Continue to next middleware
 * 3. checkCredits(1): Verify user has at least 1 credit
 * 4. createSummary: Generate new summary, deduct credit, cache result
 */
router.post('/', protect, cacheMiddleware, checkCredits(1), createSummary);

/**
 * @route   POST /api/summaries/upload
 * @desc    Create summary from uploaded file (.txt or .docx)
 * @access  Private (requires authentication and 1 credit)
 * @middleware  protect -> upload.single('file') -> cacheMiddleware -> checkCredits(1) -> createSummaryFromFile
 */
router.post('/upload', protect, upload.single('file'), cacheMiddleware, checkCredits(1), createSummaryFromFile);

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
 * @route   POST /api/summaries/:id/regenerate
 * @desc    Regenerate summary with custom prompt (no credit cost)
 * @access  Private (user can only regenerate their own summaries)
 */
router.post('/:id/regenerate', protect, regenerateSummary);

/**
 * @route   DELETE /api/summaries/:id
 * @desc    Delete a specific summary
 * @access  Private (user can only delete their own summaries)
 */
router.delete('/:id', protect, deleteSummary);

// Async routes using Bull queue  
router.post('/async', protect, checkCredits(1), createSummaryAsync);
router.post('/upload/async', protect, upload.single('file'), checkCredits(1), createSummaryFromFileAsync);
router.get('/job/:jobId', protect, getJobStatus);

module.exports = router;