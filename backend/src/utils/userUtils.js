const User = require('../models/User');
const { generateSecureToken, generateUsername } = require('./generateToken');


/**
 * Generate a unique username
 * @param {string} baseName - Base name (default: 'user')
 * @returns {Promise<string>} Unique username
 */
const generateUniqueUsername = async (baseName = 'user') => {
  let username;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!isUnique && attempts < maxAttempts) {
    username = generateUsername(baseName);
    
    const existingUser = await User.findOne({ 
      username: new RegExp(`^${username}$`, 'i')
    });
    
    isUnique = !existingUser;
    attempts++;
  }
  
  if (!isUnique) {
    // Fallback with timestamp
    const timestamp = Date.now().toString(36);
    username = `${baseName}_${timestamp}`;
  }
  
  return username;
};

/**
 * Create a new user with generated token
 * @returns {Promise<Object>} User data with plain token
 */
const createNewUser = async () => {
  try {
    // Generate access token
    const accessToken = generateSecureToken();
    
        const username = await generateUniqueUsername();
    // Create user with token
    const user = new User({
      accessToken,
      username
    });
    
    await user.save();
    
    // Return user with plain token (only once!)
    return {
      _id: user._id,
      accessToken, // Plain token - only time it's exposed
      username: user.username,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
    
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Validate user token and get user
 * @param {string} token - Access token
 * @returns {Promise<User|null>} User if valid, null if not
 */
const validateUserToken = async (token) => {
  try {
    // First, try to find by plain token (for newly registered users)
    const user = await User.findOne({ accessToken: token });
    
    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      return user;
    }
    
    // If not found by plain token, we need to check hashed tokens
    // This is more complex and requires a different approach
    // For simplicity in personal project, we'll just check plain tokens
    
    return null;
    
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<User>} Updated user
 */
const updateUserProfile = async (userId, updates) => {
  const allowedUpdates = ['username', 'avatar', 'preferences'];
  const updateData = {};
  
  // Filter only allowed fields
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updateData[key] = updates[key];
    }
  });
  
  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update');
  }
  
  // Check username availability if username is being updated
  if (updateData.username) {
    const isAvailable = await User.isUsernameAvailable(updateData.username);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }
  }
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

module.exports = {
  generateUniqueUsername,
  createNewUser,
  validateUserToken,
  updateUserProfile,
};