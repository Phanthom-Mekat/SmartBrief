require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

/**
 * Utility script to create the first admin user
 * Run with: node createAdmin.js
 */

const createFirstAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create first admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@smartbrief.com',
      password: 'Admin123!', // Change this password!
      role: 'admin',
      credits: 100
    });

    await adminUser.save();
    console.log('✅ First admin user created successfully!');
    console.log('Email: admin@smartbrief.com');
    console.log('Password: Admin123!');
    console.log('⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
createFirstAdmin();