require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

/**
 * Utility script to create test users with different roles
 * Run with: node createTestUsers.js
 */

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete existing test users (except admin)
    await User.deleteMany({ 
      email: { 
        $in: [
          'user@smartbrief.com',
          'editor@smartbrief.com',
          'reviewer@smartbrief.com',
          'demo@smartbrief.com'
        ] 
      } 
    });
    console.log('✓ Cleared existing test users\n');

    // Create test users with different roles
    const testUsers = [
      {
        name: 'Regular User',
        email: 'user@smartbrief.com',
        password: 'user123',
        role: 'user',
        credits: 10
      },
      {
        name: 'Editor User',
        email: 'editor@smartbrief.com',
        password: 'editor123',
        role: 'editor',
        credits: 20
      },
      {
        name: 'Reviewer User',
        email: 'reviewer@smartbrief.com',
        password: 'reviewer123',
        role: 'reviewer',
        credits: 15
      },
      {
        name: 'Demo User',
        email: 'demo@smartbrief.com',
        password: 'demo123',
        role: 'user',
        credits: 5
      }
    ];

    console.log('Creating test users...\n');
    
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created ${userData.role.toUpperCase()} user:`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Credits: ${userData.credits}\n`);
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ ALL TEST USERS CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════\n');

    console.log('📋 TEST CREDENTIALS SUMMARY:\n');
    console.log('1. ADMIN (Full Access):');
    console.log('   Email: admin@smartbrief.com');
    console.log('   Password: Admin123!\n');

    console.log('2. EDITOR (Can edit/delete any summary):');
    console.log('   Email: editor@smartbrief.com');
    console.log('   Password: editor123\n');

    console.log('3. REVIEWER (Read-only, can view all):');
    console.log('   Email: reviewer@smartbrief.com');
    console.log('   Password: reviewer123\n');

    console.log('4. USER (Can only manage own summaries):');
    console.log('   Email: user@smartbrief.com');
    console.log('   Password: user123\n');

    console.log('5. DEMO USER (Regular user):');
    console.log('   Email: demo@smartbrief.com');
    console.log('   Password: demo123\n');

    console.log('═══════════════════════════════════════════');
    console.log('🎯 HOW TO TEST PERMISSIONS:');
    console.log('═══════════════════════════════════════════\n');
    
    console.log('Step 1: Login as ADMIN');
    console.log('  → Go to http://localhost:5173/login');
    console.log('  → Use admin@smartbrief.com / Admin123!');
    console.log('  → Create some summaries');
    console.log('  → Go to /history and see your summaries\n');

    console.log('Step 2: Test ADMIN panel');
    console.log('  → Visit http://localhost:5173/admin (if route exists)');
    console.log('  → Or test API: https://aismartbrief.vercel.app/api/admin/users');
    console.log('  → Admin can see all users and manage credits\n');

    console.log('Step 3: Login as EDITOR');
    console.log('  → Logout and login as editor@smartbrief.com / editor123');
    console.log('  → Create summaries');
    console.log('  → Try to edit/delete other users\' summaries\n');

    console.log('Step 4: Login as REVIEWER');
    console.log('  → Login as reviewer@smartbrief.com / reviewer123');
    console.log('  → View summaries (read-only)');
    console.log('  → Cannot edit or delete\n');

    console.log('Step 5: Login as USER');
    console.log('  → Login as user@smartbrief.com / user123');
    console.log('  → Can only see and manage own summaries\n');

    console.log('═══════════════════════════════════════════');
    console.log('🧪 TEST API ENDPOINTS:');
    console.log('═══════════════════════════════════════════\n');
    
    console.log('Admin Only:');
    console.log('  GET  https://aismartbrief.vercel.app/api/test/admin');
    console.log('  GET  https://aismartbrief.vercel.app/api/admin/users\n');

    console.log('Admin OR Editor:');
    console.log('  GET  https://aismartbrief.vercel.app/api/test/editor\n');

    console.log('Admin OR Editor OR Reviewer:');
    console.log('  GET  https://aismartbrief.vercel.app/api/test/reviewer\n');

    console.log('Any Authenticated User:');
    console.log('  GET  https://aismartbrief.vercel.app/api/test/user');
    console.log('  GET  https://aismartbrief.vercel.app/api/summaries\n');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
createTestUsers();
