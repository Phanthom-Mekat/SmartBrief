const redis = require('redis');

/**
 * Redis Client Configuration
 * Connects to Redis instance for caching summarization results
 */

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis client with configuration
 */
const initializeRedis = async () => {
  try {
    // Check if Redis URL is provided
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Create Redis client
    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis: Max reconnection attempts reached');
            return new Error('Redis connection failed after 10 retries');
          }
          // Exponential backoff: 50ms, 100ms, 200ms, etc.
          return Math.min(retries * 50, 3000);
        },
      },
    });

    // Error handling
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis client connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✓ Redis client connected and ready');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
      isConnected = false;
    });

    redisClient.on('end', () => {
      console.log('Redis client connection closed');
      isConnected = false;
    });

    // Connect to Redis
    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis:', error.message);
    console.warn('⚠ Application will continue without caching');
    return null;
  }
};

/**
 * Get the Redis client instance
 * @returns {Object|null} Redis client or null if not connected
 */
const getRedisClient = () => {
  if (!redisClient || !isConnected) {
    return null;
  }
  return redisClient;
};

/**
 * Check if Redis is connected and available
 * @returns {boolean} Connection status
 */
const isRedisConnected = () => {
  return isConnected && redisClient !== null;
};

/**
 * Set a value in Redis with optional expiration
 * @param {string} key - Cache key
 * @param {string} value - Value to cache (will be stringified if object)
 * @param {number} expirationSeconds - TTL in seconds (default: 24 hours)
 * @returns {Promise<boolean>} Success status
 */
const setCache = async (key, value, expirationSeconds = 86400) => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.setEx(key, expirationSeconds, stringValue);
    return true;
  } catch (error) {
    console.error('Redis SET error:', error.message);
    return false;
  }
};

/**
 * Get a value from Redis cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null
 */
const getCache = async (key) => {
  try {
    if (!isRedisConnected()) {
      return null;
    }

    const value = await redisClient.get(key);
    
    if (!value) {
      return null;
    }

    // Try to parse JSON, return string if parsing fails
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error('Redis GET error:', error.message);
    return null;
  }
};

/**
 * Delete a value from Redis cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
const deleteCache = async (key) => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis DELETE error:', error.message);
    return false;
  }
};

/**
 * Clear all cache entries matching a pattern
 * @param {string} pattern - Key pattern (e.g., 'user:123:*')
 * @returns {Promise<number>} Number of keys deleted
 */
const clearCachePattern = async (pattern) => {
  try {
    if (!isRedisConnected()) {
      return 0;
    }

    const keys = await redisClient.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }

    await redisClient.del(keys);
    return keys.length;
  } catch (error) {
    console.error('Redis CLEAR PATTERN error:', error.message);
    return 0;
  }
};

/**
 * Get cache statistics
 * @returns {Promise<Object>} Redis info and stats
 */
const getCacheStats = async () => {
  try {
    if (!isRedisConnected()) {
      return {
        connected: false,
        error: 'Redis not connected',
      };
    }

    const info = await redisClient.info('stats');
    const dbSize = await redisClient.dbSize();

    return {
      connected: true,
      keysCount: dbSize,
      info: info,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
};

/**
 * Gracefully close Redis connection
 */
const closeRedis = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      console.log('Redis connection closed gracefully');
    }
  } catch (error) {
    console.error('Error closing Redis connection:', error.message);
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  isRedisConnected,
  setCache,
  getCache,
  deleteCache,
  clearCachePattern,
  getCacheStats,
  closeRedis,
};
