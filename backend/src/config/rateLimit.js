const rateLimit  = require('express-rate-limit');
const  { ipKeyGenerator} = require('express-rate-limit')

/**
 * Rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_AUTH || 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests too
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res, next, options) => {
    res.status(options.statusCode || 429).json({
      success: false,
      error: options.message.error,
      retryAfter: Math.ceil(options.windowMs / 1000), // Convert to seconds
      limit: options.max,
      window: `${options.windowMs / 60000} minutes`
    });
  }
});

/**
 * Rate limiter for API endpoints (general)
 */
const apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_API || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false, // Count failed requests
});

/**
 * Strict rate limiter for sensitive operations
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.RATE_LIMIT_MAX_STRICT, // Limit each IP to 10 requests per hour
  message: {
    success: false,
    error: 'Too many requests to this endpoint. Please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});



/**
 * Create a custom rate limiter
 * @param {Object} options - Rate limit options
 * @returns {Object} Rate limiter middleware
 */
const createLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      error: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  };

  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * Get rate limit configuration
 * @returns {Object} Rate limit settings
 */
const getRateLimitConfig = () => {
  return {
    auth: {
      windowMs: 15 * 60 * 1000,
      max: process.env.RATE_LIMIT_MAX_AUTH || 20,
      window: '15 minutes'
    },
    api: {
      windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
      max: process.env.RATE_LIMIT_MAX_API || 100,
      window: '15 minutes'
    },
    strict: {
      windowMs: 60 * 60 * 1000,
      max: process.env.RATE_LIMIT_MAX_STRICT || 10,
      window: '1 hour'
    },
    environment: process.env.NODE_ENV,
    skipLocalhost: process.env.NODE_ENV === 'development'
  };
};

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter,
  createLimiter,
  getRateLimitConfig
};