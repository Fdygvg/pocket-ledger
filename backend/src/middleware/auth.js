const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies user access token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.cookies.pocketledger_token;
    
    if (!token || token.trim().length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No access token found in cookie. Please login.'
      });
    }
 
    // Find user by access token
    const user = await User.findOne({ accessToken: token.trim() });
    
   if (!user) {
      res.clearCookie('pocketledger_token');
      return res.status(401).json({
        success: false,
        error: 'Invalid session',
        message: 'Your session is invalid. Please login again.'
      });
    }
    
    // Check if user is active
   if (!user.isActive) {
      res.clearCookie('pocketledger_token');
      return res.status(403).json({
        success: false,
        error: 'Account deactivated'
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
};

/**
 * Optional authentication middleware
 * Tries to authenticate but doesn't fail if token is missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token && token.trim().length > 0) {
        const user = await User.findOne({ accessToken: token.trim() });
        
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Don't throw error for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};