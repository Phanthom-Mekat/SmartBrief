// Test script to demonstrate the AI summarization functionality
// Run with: node testSummarization.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test content for summarization
const testContent = `
Artificial Intelligence (AI) is a rapidly evolving field of computer science that aims to create machines capable of performing tasks that typically require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding. The history of AI dates back to the 1950s when Alan Turing proposed the famous Turing Test as a way to measure machine intelligence.

Over the decades, AI has gone through several periods of excitement and disappointment, known as AI winters. However, recent advances in machine learning, particularly deep learning and neural networks, have led to remarkable breakthroughs in areas such as image recognition, natural language processing, and game playing.

Machine learning is a subset of AI that focuses on the development of algorithms that can learn and improve from experience without being explicitly programmed. Deep learning, a further subset of machine learning, uses artificial neural networks with multiple layers to model and understand complex patterns in data.

Today, AI applications are everywhere, from virtual assistants like Siri and Alexa to recommendation systems on streaming platforms and e-commerce websites. In healthcare, AI is being used for medical imaging, drug discovery, and personalized treatment plans. In finance, AI algorithms help with fraud detection, algorithmic trading, and credit scoring.

The future of AI holds immense promise, with potential applications in autonomous vehicles, climate change mitigation, smart cities, and many other fields that could significantly impact human society. However, the development of AI also raises important ethical questions about privacy, job displacement, algorithmic bias, and the need for responsible AI development.

As AI continues to advance, it is crucial for researchers, policymakers, and society as a whole to work together to ensure that AI technologies are developed and deployed in ways that benefit humanity while minimizing potential risks and negative consequences.
`;

async function testSummarization() {
  try {
    console.log('🚀 Starting AI Summarization Test\n');

    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      password: 'password123'
    });

    const token = registerResponse.data.token;
    const user = registerResponse.data.user;
    console.log(`✅ User registered: ${user.name} with ${user.credits} credits\n`);

    // Step 2: Check user credits before summarization
    console.log('2. Checking user profile...');
    const profileResponse = await axios.get(`${BASE_URL}/test/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ User has ${profileResponse.data.user.credits} credits available\n`);

    // Step 3: Create a summary
    console.log('3. Creating AI summary...');
    console.log(`📄 Original content: ${testContent.substring(0, 100)}...\n`);
    
    const summaryResponse = await axios.post(`${BASE_URL}/summaries`, {
      content: testContent
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const summaryData = summaryResponse.data.data;
    console.log('✅ Summary created successfully!');
    console.log(`📝 Summary: ${summaryData.summary.summarizedContent}\n`);
    console.log('📊 Statistics:');
    console.log(`   - Original words: ${summaryData.summary.originalWordCount}`);
    console.log(`   - Summary words: ${summaryData.summary.summaryWordCount}`);
    console.log(`   - Compression: ${summaryData.statistics.compressionPercentage}`);
    console.log(`   - Processing time: ${summaryData.summary.processingTime}ms`);
    console.log(`   - Credits remaining: ${summaryData.user.creditsRemaining}\n`);

    // Step 4: Get user's summaries
    console.log('4. Retrieving user summaries...');
    const summariesResponse = await axios.get(`${BASE_URL}/summaries`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const summariesData = summariesResponse.data.data;
    console.log(`✅ Found ${summariesData.summaries.length} summaries`);
    console.log('📈 User Statistics:');
    console.log(`   - Total summaries: ${summariesData.statistics.totalSummaries}`);
    console.log(`   - Total words processed: ${summariesData.statistics.totalOriginalWords}`);
    console.log(`   - Words saved: ${summariesData.statistics.wordsReduced}`);
    console.log(`   - Average compression: ${summariesData.statistics.averageCompressionPercentage}\n`);

    // Step 5: Get specific summary with full content
    const summaryId = summariesData.summaries[0]._id;
    console.log('5. Retrieving full summary details...');
    const fullSummaryResponse = await axios.get(`${BASE_URL}/summaries/${summaryId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Full summary retrieved');
    console.log(`🔍 Summary ID: ${summaryId}`);
    console.log(`📅 Created: ${new Date(fullSummaryResponse.data.data.summary.createdAt).toLocaleString()}`);
    console.log(`🤖 AI Model: ${fullSummaryResponse.data.data.summary.aiModel}\n`);

    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 402) {
      console.log('💡 This error is expected if the user has insufficient credits');
    }
    
    if (error.response?.status === 503) {
      console.log('💡 AI service may be temporarily unavailable or API key issues');
    }
  }
}

// Run the test
testSummarization();