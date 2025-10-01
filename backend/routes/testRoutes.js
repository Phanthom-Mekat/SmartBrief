const express = require('express');
const router = express.Router();
const { protect, authorize, checkCredits } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/test/user
 * @desc    Test route accessible by any authenticated user
 * @access  Private
 */
router.get('/user', protect, (req, res) => {
  res.json({
    message: 'Access granted to authenticated user',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      credits: req.user.credits
    }
  });
});

/**
 * @route   GET /api/test/admin
 * @desc    Test route accessible only by admin users
 * @access  Private (Admin only)
 */
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.json({
    message: 'Access granted to admin user',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    },
    adminData: {
      message: 'This is sensitive admin data',
      systemInfo: 'Only admins can see this'
    }
  });
});

/**
 * @route   GET /api/test/editor
 * @desc    Test route accessible by admin and editor users
 * @access  Private (Admin, Editor)
 */
router.get('/editor', protect, authorize('admin', 'editor'), (req, res) => {
  res.json({
    message: 'Access granted to admin or editor user',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    },
    editorData: {
      message: 'This is editor-level data',
      permissions: ['read', 'write', 'edit']
    }
  });
});

/**
 * @route   GET /api/test/reviewer
 * @desc    Test route accessible by admin, editor, and reviewer users
 * @access  Private (Admin, Editor, Reviewer)
 */
router.get('/reviewer', protect, authorize('admin', 'editor', 'reviewer'), (req, res) => {
  res.json({
    message: 'Access granted to admin, editor, or reviewer user',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    },
    reviewerData: {
      message: 'This is reviewer-level data',
      permissions: ['read', 'review']
    }
  });
});

/**
 * @route   GET /api/test/credits
 * @desc    Test route that requires credits (simulating a paid feature)
 * @access  Private (Requires 2 credits)
 */
router.get('/credits', protect, checkCredits(2), (req, res) => {
  res.json({
    message: 'Access granted - sufficient credits available',
    user: {
      id: req.user._id,
      name: req.user.name,
      credits: req.user.credits
    },
    creditInfo: {
      required: 2,
      available: req.user.credits,
      remaining: req.user.credits - 2
    }
  });
});

/**
 * @route   GET /api/test/multi-role-credits
 * @desc    Test route combining role and credit requirements
 * @access  Private (Admin or Editor with 3+ credits)
 */
router.get('/multi-role-credits', protect, authorize('admin', 'editor'), checkCredits(3), (req, res) => {
  res.json({
    message: 'Access granted - role and credit requirements met',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
      credits: req.user.credits
    },
    accessInfo: {
      roleRequired: ['admin', 'editor'],
      creditsRequired: 3,
      accessGranted: true
    }
  });
});

module.exports = router;