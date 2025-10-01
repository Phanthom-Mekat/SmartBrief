const crypto = require('crypto');
const { getCache, isRedisConnected } = require('../config/redisClient');

/**
 * Cache Middleware for Summary Requests
 * Checks if a summary for the same content already exists in Redis cache
 * If found, returns cached result without charging credits or calling AI
 */
const cacheMiddleware = async (req, res, next) => {
  try {
    // Skip caching if Redis is not connected
    if (!isRedisConnected()) {
      console.log('Redis not connected, skipping cache check');
      return next();
    }

    const { content } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!content || typeof content !== 'string') {
      return next();
    }

    // Generate unique cache key
    // Format: summary:userId:contentHash
    const contentHash = crypto
      .createHash('sha256')
      .update(content.trim())
      .digest('hex');
    
    const cacheKey = `summary:${userId}:${contentHash}`;

    // Try to get cached result
    const cachedResult = await getCache(cacheKey);

    if (cachedResult) {
      // Cache hit! Return cached result
      console.log(`✓ Cache HIT for user ${req.user.name} - key: ${cacheKey.substring(0, 40)}...`);
      
      // Add cache metadata
      const response = {
        success: true,
        message: 'Summary retrieved from cache',
        fromCache: true,
        data: {
          summary: {
            ...cachedResult,
            // Update timestamp to current time for user experience
            retrievedAt: new Date(),
          },
          user: {
            creditsRemaining: req.user.credits, // No credit deduction for cached results
            creditsUsed: 0,
          },
        },
      };

      return res.status(200).json(response);
    }

    // Cache miss - attach cache key to request for later use
    console.log(`✗ Cache MISS for user ${req.user.name} - proceeding to AI generation`);
    req.cacheKey = cacheKey;
    
    // Continue to next middleware (credit check and summary generation)
    next();

  } catch (error) {
    // On cache error, log and continue without caching
    console.error('Cache middleware error:', error.message);
    next();
  }
};

/**
 * Generate cache key for a given user and content
 * Exported for testing and manual cache operations
 * @param {string} userId - User ID
 * @param {string} content - Content to summarize
 * @returns {string} Cache key
 */
const generateCacheKey = (userId, content) => {
  const contentHash = crypto
    .createHash('sha256')
    .update(content.trim())
    .digest('hex');
  
  return `summary:${userId}:${contentHash}`;
};

/**
 * Cache invalidation middleware
 * Can be used to invalidate specific cache entries or patterns
 */
const invalidateUserCache = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    if (isRedisConnected()) {
      const { clearCachePattern } = require('../config/redisClient');
      const deletedCount = await clearCachePattern(`summary:${userId}:*`);
      console.log(`Invalidated ${deletedCount} cache entries for user ${userId}`);
    }
    
    next();
  } catch (error) {
    console.error('Cache invalidation error:', error.message);
    next();
  }
};

module.exports = {
  cacheMiddleware,
  generateCacheKey,
  invalidateUserCache,
};
