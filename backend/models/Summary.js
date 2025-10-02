const mongoose = require('mongoose');

// Summary Schema definition
const summarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalContent: {
    type: String,
    required: true
  },
  summarizedContent: {
    type: String,
    required: true
  },
  originalWordCount: {
    type: Number
  },
  summaryWordCount: {
    type: Number
  },
  compressionRatio: {
    type: Number // Calculated as summaryWordCount / originalWordCount
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  processingTime: {
    type: Number, // Time taken to generate summary in milliseconds
    default: 0
  },
  aiModel: {
    type: String,
    default: 'openai/gpt-oss-120b'
  },
  uploadedFileName: {
    type: String,
    default: null
  },
  isFallback: {
    type: Boolean,
    default: false
  },
  customPrompt: {
    type: String,
    default: null
  },
  regenerationCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Index for efficient user queries
summarySchema.index({ user: 1, createdAt: -1 });

// Virtual for summary statistics
summarySchema.virtual('statistics').get(function() {
  return {
    originalLength: this.originalContent.length,
    summaryLength: this.summarizedContent.length,
    compressionPercentage: ((1 - this.compressionRatio) * 100).toFixed(1) + '%',
    wordsReduced: this.originalWordCount - this.summaryWordCount
  };
});

// Helper method to count words
const countWords = (text) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Pre-save hook to calculate word counts and compression ratio
summarySchema.pre('save', function(next) {
  // Always calculate word counts if not already set (e.g., from fallback)
  if (this.originalContent && this.summarizedContent) {
    if (!this.originalWordCount || !this.summaryWordCount) {
      this.originalWordCount = countWords(this.originalContent);
      this.summaryWordCount = countWords(this.summarizedContent);
      this.compressionRatio = this.originalWordCount > 0 
        ? this.summaryWordCount / this.originalWordCount 
        : 0;
    }
  }
  next();
});

module.exports = mongoose.model('Summary', summarySchema);