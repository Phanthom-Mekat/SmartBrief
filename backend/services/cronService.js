const cron = require('node-cron');
const User = require('../models/User');

/**
 * Cron Job Service
 * Handles scheduled tasks for the application
 */

/**
 * Deactivate users who have been inactive for 7+ days
 * Runs daily at midnight (00:00)
 */
const deactivateInactiveUsers = cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🕐 Running cron job: Deactivate Inactive Users');
    
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find users who are:
    // 1. Currently active
    // 2. Haven't been active in 7+ days
    // 3. Are not admin (admins should not be deactivated)
    const result = await User.updateMany(
      {
        isActive: true,
        role: { $ne: 'admin' }, // Don't deactivate admins
        lastActive: { $lt: sevenDaysAgo }
      },
      {
        $set: { isActive: false }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Deactivated ${result.modifiedCount} inactive user(s)`);
    } else {
      console.log('✓ No inactive users found to deactivate');
    }

  } catch (error) {
    console.error('❌ Cron job error (deactivate inactive users):', error);
  }
}, {
  scheduled: false, // Don't start immediately, will be started manually
  timezone: 'UTC'
});

/**
 * Start all cron jobs
 */
const startCronJobs = () => {
  console.log('⏰ Starting cron jobs...');
  deactivateInactiveUsers.start();
  console.log('✓ Cron job scheduled: Deactivate Inactive Users (daily at midnight UTC)');
};

/**
 * Stop all cron jobs (for graceful shutdown)
 */
const stopCronJobs = () => {
  console.log('⏰ Stopping cron jobs...');
  deactivateInactiveUsers.stop();
  console.log('✓ All cron jobs stopped');
};

module.exports = {
  startCronJobs,
  stopCronJobs,
  deactivateInactiveUsers
};
