require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

/**
 * Test all user credentials
 */
const testCredentials = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const testUsers = [
      { email: 'admin@smartbrief.com', password: 'Admin123!', expectedRole: 'admin' },
      { email: 'editor@smartbrief.com', password: 'editor123', expectedRole: 'editor' },
      { email: 'reviewer@smartbrief.com', password: 'reviewer123', expectedRole: 'reviewer' },
      { email: 'user@smartbrief.com', password: 'user123', expectedRole: 'user' },
      { email: 'demo@smartbrief.com', password: 'demo123', expectedRole: 'user' },
    ];

    console.log('🧪 Testing User Credentials...\n');
    console.log('═══════════════════════════════════════════\n');

    for (const testUser of testUsers) {
      const user = await User.findOne({ email: testUser.email });
      
      if (!user) {
        console.log(`❌ ${testUser.email}`);
        console.log(`   Status: USER NOT FOUND\n`);
        continue;
      }

      const isMatch = await user.comparePassword(testUser.password);
      
      if (isMatch && user.role === testUser.expectedRole) {
        console.log(`✅ ${testUser.email}`);
        console.log(`   Password: ${testUser.password}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Credits: ${user.credits}`);
        console.log(`   Status: ✓ WORKING\n`);
      } else if (!isMatch) {
        console.log(`❌ ${testUser.email}`);
        console.log(`   Password: INCORRECT`);
        console.log(`   Status: PASSWORD MISMATCH\n`);
      } else {
        console.log(`⚠️  ${testUser.email}`);
        console.log(`   Password: ${testUser.password}`);
        console.log(`   Expected Role: ${testUser.expectedRole}`);
        console.log(`   Actual Role: ${user.role}`);
        console.log(`   Status: ROLE MISMATCH\n`);
      }
    }

    console.log('═══════════════════════════════════════════\n');
    console.log('🎯 QUICK LOGIN TEST:\n');
    console.log('1. Open http://localhost:5173/login');
    console.log('2. Try each credential above');
    console.log('3. Check role badge in top-right\n');
    
    console.log('🔑 Admin Features:');
    console.log('   → "Admin Panel" link in navbar');
    console.log('   → Access http://localhost:5173/admin');
    console.log('   → Manage all users, recharge credits\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

testCredentials();
