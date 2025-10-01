const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  rechargeUserCredits,
  updateUserRole,
  deleteUser,
  getUserById
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
// Using protect middleware to verify JWT and authorize middleware to check admin role

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with statistics
 * @access  Private/Admin
 */
router.get('/users', protect, authorize('admin'), getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get specific user by ID
 * @access  Private/Admin
 */
router.get('/users/:id', protect, authorize('admin'), getUserById);

/**
 * @route   PUT /api/admin/users/:id/recharge
 * @desc    Add credits to a user's account
 * @access  Private/Admin
 */
router.put('/users/:id/recharge', protect, authorize('admin'), rechargeUserCredits);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user's role
 * @access  Private/Admin
 */
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Private/Admin
 */
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;