// diagnose.js
// Run this script to diagnose deployment issues
// Usage: node diagnose.js

require('dotenv').config();

console.log('🔍 SmartBrief Backend Diagnostics\n');
console.log('='.repeat(50));

// Check Node version
console.log('\n📦 Node.js Version:', process.version);
console.log('   Required: >= 18.x');

// Check environment
console.log('\n🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('   Serverless Detection:');
console.log('   - VERCEL:', process.env.VERCEL || 'not detected');
console.log('   - AWS Lambda:', process.env.AWS_LAMBDA_FUNCTION_NAME || 'not detected');

// Check environment variables
console.log('\n🔑 Environment Variables:');
const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'GROQ_API_KEY'];
const optionalVars = ['REDIS_URL', 'PORT'];

requiredVars.forEach(varName => {
  const exists = !!process.env[varName];
  const status = exists ? '✅' : '❌';
  const preview = exists 
    ? process.env[varName].substring(0, 20) + '...' 
    : 'NOT SET';
  console.log(`   ${status} ${varName}: ${preview}`);
});

console.log('\n   Optional Variables:');
optionalVars.forEach(varName => {
  const exists = !!process.env[varName];
  const status = exists ? '✅' : '⚠️ ';
  const preview = exists 
    ? process.env[varName].substring(0, 20) + '...' 
    : 'NOT SET (will use defaults)';
  console.log(`   ${status} ${varName}: ${preview}`);
});

// Test MongoDB connection
console.log('\n🗄️  Testing MongoDB Connection...');
const mongoose = require('mongoose');

const testMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('   ✅ MongoDB connection successful');
    console.log('   Database:', mongoose.connection.name);
    await mongoose.connection.close();
  } catch (error) {
    console.error('   ❌ MongoDB connection failed:', error.message);
    console.error('   Tips:');
    console.error('   - Check if MONGO_URI is correct');
    console.error('   - Ensure MongoDB Atlas allows connections from 0.0.0.0/0');
    console.error('   - Verify database user has correct permissions');
  }
};

// Test Redis connection (optional)
const testRedis = async () => {
  console.log('\n📮 Testing Redis Connection...');
  
  if (!process.env.REDIS_URL) {
    console.log('   ⚠️  REDIS_URL not set - Redis features disabled');
    return;
  }

  const redis = require('redis');
  const client = redis.createClient({
    url: process.env.REDIS_URL,
    socket: { connectTimeout: 5000 }
  });

  try {
    await client.connect();
    await client.ping();
    console.log('   ✅ Redis connection successful');
    await client.quit();
  } catch (error) {
    console.error('   ⚠️  Redis connection failed:', error.message);
    console.error('   Note: Redis is optional. App will work without it.');
  }
};

// Test Groq API
const testGroqAPI = async () => {
  console.log('\n🤖 Testing Groq API...');
  
  if (!process.env.GROQ_API_KEY) {
    console.error('   ❌ GROQ_API_KEY not set');
    return;
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "test successful" in exactly two words.' }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 10,
    });

    console.log('   ✅ Groq API connection successful');
    console.log('   Response:', completion.choices[0]?.message?.content);
  } catch (error) {
    console.error('   ❌ Groq API test failed:', error.message);
    console.error('   Tips:');
    console.error('   - Verify GROQ_API_KEY is correct');
    console.error('   - Check API quota/limits');
    console.error('   - Ensure API key has correct permissions');
  }
};

// Check package dependencies
console.log('\n📚 Checking Dependencies...');
try {
  const pkg = require('./package.json');
  const critical = ['express', 'mongoose', 'jsonwebtoken', 'groq-sdk'];
  
  critical.forEach(dep => {
    const installed = pkg.dependencies[dep];
    const status = installed ? '✅' : '❌';
    console.log(`   ${status} ${dep}: ${installed || 'NOT INSTALLED'}`);
  });
} catch (error) {
  console.error('   ❌ Could not read package.json');
}

// Run all tests
const runDiagnostics = async () => {
  await testMongoDB();
  await testRedis();
  await testGroqAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Diagnostics Complete\n');
  
  console.log('📝 Next Steps:');
  console.log('   1. Fix any ❌ errors shown above');
  console.log('   2. Test locally: npm run dev');
  console.log('   3. Deploy to Vercel: vercel --prod');
  console.log('   4. Check Vercel logs: vercel logs\n');
  
  process.exit(0);
};

runDiagnostics().catch(err => {
  console.error('\n❌ Diagnostic script failed:', err);
  process.exit(1);
});
