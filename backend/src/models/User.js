const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  // Identification
  accessToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  hashedAccessToken: {
    type: String,
    required: true,
    select: false,
  },

  // Profile Information
  username: {
    type: String,
    default: `user_${crypto.randomBytes(4).toString('hex')}`, // user_abc123
    trim: true,
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  avatar: {
    type: String,
    default: '👤', // Default emoji avatar
    enum: [
      '👤', '😊', '😎', '🤖', '🐱', '🦊', '🐶', '🦁', '🐯', '🐼',
      '🐵', '🦄', '🐙', '🦉', '🐳', '🌈', '🎯', '🚀', '🎨', '🎮',
      '🍕', '☕', '🎸', '📚', '⚽', '🎭', '💎', '🌟', '🔥', '💧'
    ], // Preset emojis
  },

  // User Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    currency: {
      type: String,
      default: '₦',
    },
    recentTags: {
      type: [String],
      default: [],
    },
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // Statistics (optional)
  stats: {
    totalSections: {
      type: Number,
      default: 0,
    },
    totalBills: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true, // Auto-manage createdAt and updatedAt
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      // Remove sensitive fields from JSON output
      delete ret.hashedAccessToken;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.hashedAccessToken;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Hash the access token before validation so required checks pass
 */
UserSchema.pre('validate', async function () {
  if (!this.isModified('accessToken')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.hashedAccessToken = await bcrypt.hash(this.accessToken, salt);
  } catch (error) {
    throw error;
  }
});

/**
 * Update the updatedAt timestamp on save
 */
UserSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

/**
 * Compare provided token with hashed token
 * @param {string} candidateToken - Token to verify
 * @returns {Promise<boolean>} True if tokens match
 */
UserSchema.methods.compareToken = async function (candidateToken) {
  try {
    return await bcrypt.compare(candidateToken, this.hashedAccessToken);
  } catch (error) {
    throw new Error('Token comparison failed');
  }
};

/**
 * Generate a new secure access token
 * @returns {string} Random 64-character hex string
 */
UserSchema.statics.generateAccessToken = function () {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Find user by access token
 * @param {string} token - Access token
 * @returns {Promise<User|null>} User document or null
 */
UserSchema.statics.findByToken = async function (token) {
  try {
    // First find user by accessToken (for registration lookup)
    let user = await this.findOne({ accessToken: token });

    // If not found, try to find by comparing hashed token (for login)
    if (!user) {
      // This requires a different approach since hashedAccessToken is not selectable
      // We'll handle this in the auth controller
      return null;
    }

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if username is available
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} True if available
 */
UserSchema.statics.isUsernameAvailable = async function (username) {
  const user = await this.findOne({
    username: new RegExp(`^${username}$`, 'i') // Case insensitive
  });
  return !user;
};

/**
 * Update user statistics
 * @param {string} userId - User ID
 * @param {Object} updates - Statistics updates
 */
UserSchema.statics.updateStats = async function (userId, updates) {
  const validFields = ['totalSections', 'totalBills', 'totalSpent'];
  const updateObj = {};

  validFields.forEach(field => {
    if (updates[field] !== undefined) {
      updateObj[`stats.${field}`] = updates[field];
    }
  });

  if (Object.keys(updateObj).length === 0) return;

  return await this.findByIdAndUpdate(
    userId,
    { $inc: updateObj },
    { new: true }
  );
};

/**
 * Virtual for formatted creation date
 */
UserSchema.virtual('createdAtFormatted').get(function () {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

/**
 * Virtual for days since registration
 */
UserSchema.virtual('daysSinceRegistration').get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Create indexes for better performance
UserSchema.index({ username: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'stats.totalSpent': -1 });

const User = mongoose.model('User', UserSchema);

module.exports = User;