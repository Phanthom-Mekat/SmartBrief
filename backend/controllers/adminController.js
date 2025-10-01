const User = require('../models/User');

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users excluding passwords, sorted by creation date
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    // Calculate total users and credits statistics
    const totalUsers = users.length;
    const totalCredits = users.reduce((sum, user) => sum + user.credits, 0);
    const averageCredits = totalUsers > 0 ? (totalCredits / totalUsers).toFixed(2) : 0;

    // Role distribution
    const roleStats = users.reduce((stats, user) => {
      stats[user.role] = (stats[user.role] || 0) + 1;
      return stats;
    }, {});

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        statistics: {
          totalUsers,
          totalCredits,
          averageCredits: parseFloat(averageCredits),
          roleDistribution: roleStats
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

/**
 * @desc    Recharge user credits
 * @route   PUT /api/admin/users/:id/recharge
 * @access  Private/Admin
 */
const rechargeUserCredits = async (req, res) => {
  const { id } = req.params;
  const { credits } = req.body;

  // Validation
  if (!credits || typeof credits !== 'number' || credits <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid positive number of credits'
    });
  }

  if (credits > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Cannot add more than 1000 credits at once'
    });
  }

  try {
    // Find user and update credits
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const previousCredits = user.credits;
    user.credits += credits;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully added ${credits} credits to ${user.name}'s account`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          previousCredits,
          currentCredits: user.credits,
          creditsAdded: credits
        }
      }
    });

    console.log(`Admin ${req.user.name} added ${credits} credits to user ${user.name} (${user.email})`);
  } catch (error) {
    console.error('Recharge credits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recharging credits',
      error: error.message
    });
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validation
  const validRoles = ['user', 'admin', 'editor', 'reviewer'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Valid roles are: ${validRoles.join(', ')}`
    });
  }

  try {
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own admin role'
      });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully updated ${user.name}'s role from ${previousRole} to ${role}`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          previousRole,
          currentRole: user.role,
          credits: user.credits
        }
      }
    });

    console.log(`Admin ${req.user.name} changed user ${user.name} role from ${previousRole} to ${role}`);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role',
      error: error.message
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Store user info before deletion for response
    const deletedUserInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits
    };

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `User ${deletedUserInfo.name} has been successfully deleted`,
      data: {
        deletedUser: deletedUserInfo
      }
    });

    console.log(`Admin ${req.user.name} deleted user ${deletedUserInfo.name} (${deletedUserInfo.email})`);
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error.message
    });
  }
};

/**
 * @desc    Get user by ID (admin only)
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  rechargeUserCredits,
  updateUserRole,
  deleteUser,
  getUserById
};