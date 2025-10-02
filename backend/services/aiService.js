const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

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
    if (!process.env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not found, returning mock summary');
      return `This is a mock summary of the original text: ${text.substring(0, 100)}...`;
    }

    // Calculate appropriate output length based on input (aim for 30-40% compression)
    const inputWordCount = text.trim().split(/\s+/).length;
    const targetOutputTokens = Math.max(2048, Math.min(8192, Math.ceil(inputWordCount * 0.6))); // 60% of input words as tokens (accounts for token overhead)

    // Create an effective prompt for summarization
    const defaultPrompt = `You are an expert text summarizer. Create a concise, comprehensive summary that is SHORTER than the original text.

## KEY RULES:

1. **COMPRESS THE TEXT**: Your summary MUST be 30-40% of the original word count. If the text is 100 words, your summary should be 30-40 words maximum.

2. **BE CONCISE**: Use fewer words while capturing all main points. Remove redundancy, examples, and elaborations. Keep only essential information.

3. **COMPLETE THOUGHTS**: Never stop mid-sentence. Finish your summary properly.

4. **EXTRACT KEY POINTS**: 
   - Identify the main topic or thesis
   - Include only the most important facts and arguments
   - Skip minor details, examples, and repetitions
   - Combine related ideas into single sentences

5. **PROFESSIONAL WRITING**: Use clear, formal language with proper grammar.

6. **LENGTH TARGETS**:
   - 100 words → 30-40 word summary
   - 500 words → 150-200 word summary  
   - 1000 words → 300-400 word summary
   - 2000+ words → 600-800 word summary

IMPORTANT: Your summary must be SIGNIFICANTLY SHORTER than the original. Focus on brevity while maintaining accuracy!`;

    const customInstructions = options.customPrompt || defaultPrompt;

    const systemPrompt = customInstructions;
    const userPrompt = `Please summarize the following text:\n\n${text}`;

    // Generate the summary using Groq
    const startTime = Date.now();
    
    const completion = await groq.chat.completions.create({
      model: options.model || "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more focused, concise output
      max_completion_tokens: targetOutputTokens,
      top_p: 0.9, // Slightly lower for more deterministic output
      reasoning_effort: "medium",
      stream: false,
      stop: null
    });

    const endTime = Date.now();
    const summary = completion.choices[0]?.message?.content || '';

    // Log performance metrics
    const processingTime = endTime - startTime;
    console.log(`Summary generated in ${processingTime}ms for ${text.length} characters`);

    // Validate the response
    if (!summary || summary.length < 10) {
      console.warn('AI generated very short summary, using fallback');
      return generateFallbackSummary(text);
    }

    // Check if summary seems complete (not cut off)
    const summaryWordCount = summary.trim().split(/\s+/).length;
    const originalWordCount = text.trim().split(/\s+/).length;
    const compressionRatio = summaryWordCount / originalWordCount;
    
    // If summary is less than 10% of original, it might be cut off - log warning
    if (compressionRatio < 0.10 && originalWordCount > 100) {
      console.warn(`Summary seems very short (${(compressionRatio * 100).toFixed(1)}% of original). Consider using fallback.`);
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
  // Split into sentences, keeping only meaningful ones
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Aim for 30-35% of original sentences
  const summaryLength = Math.max(2, Math.floor(sentences.length * 0.35));
  
  // Take sentences from beginning, middle, and end for better coverage
  const selectedSentences = [];
  const segmentSize = Math.floor(sentences.length / summaryLength);
  
  for (let i = 0; i < summaryLength && i * segmentSize < sentences.length; i++) {
    const sentenceIndex = Math.min(i * segmentSize, sentences.length - 1);
    selectedSentences.push(sentences[sentenceIndex].trim());
  }
  
  const summary = selectedSentences.join('. ') + '.';
  
  // Calculate word counts
  const originalWordCount = text.trim().split(/\s+/).length;
  const summaryWordCount = summary.trim().split(/\s+/).length;
  const compressionRatio = originalWordCount > 0 ? summaryWordCount / originalWordCount : 0;
  
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
    isConfigured: !!process.env.GROQ_API_KEY,
    model: 'openai/gpt-oss-120b',
    maxInputLength: 50000,
    minInputLength: 50,
    maxOutputTokens: 8192,
    supportedFormats: ['text/plain', '.txt', '.docx'],
    features: ['summarization', 'content-analysis', 're-prompting']
  };
};

module.exports = {
  getSummary,
  validateContent,
  getServiceStatus,
  generateFallbackSummary
};