require('dotenv').config();
const { getSummary } = require('./services/aiService');

const longTestText = `
The evolution of artificial intelligence represents one of the most significant technological developments in human history. Since the term was first coined in 1956 at the Dartmouth Conference, AI has undergone several waves of advancement and setbacks, often referred to as "AI winters" and "AI springs." The field encompasses various approaches including symbolic AI, which dominated early research, and more recent connectionist approaches based on artificial neural networks.

Machine learning, a subset of AI, has become particularly prominent in the 21st century. It enables computers to learn from data without being explicitly programmed for specific tasks. Supervised learning algorithms learn from labeled training data, while unsupervised learning discovers patterns in unlabeled data. Reinforcement learning, inspired by behavioral psychology, allows agents to learn through trial and error, receiving rewards or penalties for their actions.

Deep learning, which utilizes artificial neural networks with multiple layers, has driven many recent breakthroughs. These networks can automatically learn hierarchical representations of data, from simple features to complex abstractions. Convolutional neural networks excel at image processing tasks, while recurrent neural networks and transformers have revolutionized natural language processing. The introduction of attention mechanisms and transformer architectures, such as BERT and GPT, has led to unprecedented capabilities in understanding and generating human language.

The practical applications of AI span virtually every industry. In healthcare, AI systems assist in diagnosing diseases, analyzing medical images, predicting patient outcomes, and discovering new drugs. Financial institutions use AI for fraud detection, algorithmic trading, risk assessment, and customer service automation. The automotive industry is developing autonomous vehicles that use computer vision, sensor fusion, and decision-making algorithms to navigate complex environments safely.

Entertainment and media have been transformed by AI-powered recommendation systems that personalize content for users. Manufacturing benefits from predictive maintenance systems that anticipate equipment failures, quality control systems that identify defects, and robots that work alongside humans. Agriculture employs AI for crop monitoring, yield prediction, and precision farming techniques that optimize resource use.

However, the rapid advancement of AI raises significant ethical and societal concerns. Algorithmic bias can perpetuate and amplify existing social inequalities if training data reflects historical prejudices. Privacy concerns arise as AI systems process vast amounts of personal data. The potential for job displacement due to automation affects workers across many sectors, necessitating discussions about education, retraining, and social safety nets.

The question of AI safety and alignment—ensuring that advanced AI systems behave in accordance with human values and intentions—becomes increasingly critical as capabilities grow. Researchers work on making AI systems more interpretable and explainable, developing techniques to audit their decision-making processes. International cooperation on AI governance aims to establish ethical guidelines and regulations while fostering innovation.

Looking forward, the field continues to advance rapidly. Researchers explore artificial general intelligence (AGI), which would possess human-like cognitive abilities across diverse domains. Quantum computing may accelerate AI capabilities by solving certain problems exponentially faster. The integration of AI with other emerging technologies like biotechnology, nanotechnology, and the Internet of Things promises to reshape society in profound ways.

The development of AI requires collaboration across disciplines including computer science, neuroscience, cognitive psychology, philosophy, and ethics. As AI systems become more sophisticated and ubiquitous, ensuring their beneficial use while mitigating potential risks remains one of humanity's most important challenges in the coming decades.
`;

async function test() {
  try {
    console.log('Testing Groq API with LONG text...\n');
    const wordCount = longTestText.trim().split(/\s+/).length;
    console.log('Input text length:', longTestText.length, 'characters');
    console.log('Input word count:', wordCount, 'words');
    console.log('Expected summary: ~' + Math.floor(wordCount * 0.35) + ' words (35%)\n');
    
    const summary = await getSummary(longTestText);
    
    console.log('=== SUMMARY ===');
    console.log(summary);
    
    const summaryWords = summary.trim().split(/\s+/).length;
    const compressionRatio = (summaryWords / wordCount * 100).toFixed(1);
    
    console.log('\n=== STATS ===');
    console.log('Summary length:', summary.length, 'characters');
    console.log('Summary word count:', summaryWords, 'words');
    console.log('Compression ratio:', compressionRatio + '%');
    console.log(summaryWords < wordCount ? '✅ Summary is shorter!' : '❌ Summary is longer!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
