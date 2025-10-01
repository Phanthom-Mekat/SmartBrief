const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a summary using Google Gemini Flash model
 * @param {string} text - The original text to summarize
 * @param {Object} options - Optional parameters for summarization
 * @returns {Promise<string>} - The summarized text
 */
const getSummary = async (text, options = {}) => {
  try {
    // Validation
    if (!text || typeof text !== 'string') {
      throw new Error('Text input is required and must be a string');
    }

    if (text.length < 50) {
      throw new Error('Text must be at least 50 characters long for meaningful summarization');
    }

    if (text.length > 50000) {
      throw new Error('Text exceeds maximum length of 50,000 characters');
    }

    // If no API key is provided, return mock summary
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, returning mock summary');
      return `This is a mock summary of the original text: ${text.substring(0, 100)}...`;
    }

    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: options.model || 'gemini-1.5-flash-latest',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more focused summaries
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Create an effective prompt for summarization
    const prompt = `
Please provide a clear, concise summary of the following text. 
The summary should:
- Capture the main points and key information
- Be approximately 25-30% of the original length
- Maintain the important context and meaning
- Use clear, professional language
- Be well-structured and coherent

Text to summarize:
"""
${text}
"""

Summary:`;

    // Generate the summary
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const endTime = Date.now();

    const response = await result.response;
    const summary = response.text();

    // Log performance metrics
    const processingTime = endTime - startTime;
    console.log(`Summary generated in ${processingTime}ms for ${text.length} characters`);

    // Validate the response
    if (!summary || summary.length < 10) {
      throw new Error('Generated summary is too short or empty');
    }

    return summary.trim();

  } catch (error) {
    console.error('AI Service Error:', error);

    // Handle specific error types
    if (error.message.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.');
    }

    if (error.message.includes('quota') || error.message.includes('limit')) {
      throw new Error('AI service temporarily unavailable due to high demand. Please try again later.');
    }

    if (error.message.includes('safety') || error.message.includes('blocked')) {
      throw new Error('Content cannot be summarized due to safety restrictions.');
    }

    // For development/fallback
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning fallback summary due to error:', error.message);
      return generateFallbackSummary(text);
    }

    throw new Error('Failed to generate summary. Please try again.');
  }
};

/**
 * Generate a simple fallback summary when AI service fails
 * @param {string} text - Original text
 * @returns {Object} - Fallback summary with statistics
 */
const generateFallbackSummary = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const summaryLength = Math.max(1, Math.floor(sentences.length * 0.3));
  const selectedSentences = sentences.slice(0, summaryLength);
  const summary = selectedSentences.join('. ').trim() + (selectedSentences.length > 0 ? '.' : '');
  
  // Calculate word counts
  const originalWordCount = text.trim().split(/\s+/).length;
  const summaryWordCount = summary.trim().split(/\s+/).length;
  const compressionRatio = Math.round((summaryWordCount / originalWordCount) * 100);
  
  return {
    summary: summary,
    originalWordCount,
    summaryWordCount,
    compressionRatio,
    isFallback: true
  };
};

/**
 * Validate content before processing
 * @param {string} content - Content to validate
 * @returns {Object} - Validation result
 */
const validateContent = (content) => {
  const errors = [];
  
  if (!content || typeof content !== 'string') {
    errors.push('Content must be provided as a string');
  } else {
    if (content.length < 50) {
      errors.push('Content must be at least 50 characters long');
    }
    if (content.length > 50000) {
      errors.push('Content must not exceed 50,000 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get AI service status and configuration
 * @returns {Object} - Service status information
 */
const getServiceStatus = () => {
  return {
    isConfigured: !!process.env.GEMINI_API_KEY,
    model: 'gemini-1.5-flash-latest',
    maxInputLength: 50000,
    minInputLength: 50,
    supportedFormats: ['text/plain'],
    features: ['summarization', 'content-analysis']
  };
};

module.exports = {
  getSummary,
  validateContent,
  getServiceStatus,
  generateFallbackSummary
};