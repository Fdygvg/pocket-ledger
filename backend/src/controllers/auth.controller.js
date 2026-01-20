const User = require("../models/User");
const {
  createNewUser,
  validateUserToken,
  updateUserProfile,
} = require("../utils/userUtils");

const setTokenCookie = (res, token) => {
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const userData = await createNewUser();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          _id: userData._id,
          username: userData.username,
          avatar: userData.avatar,
          createdAt: userData.createdAt,
        },
        accessToken: userData.accessToken, // SHOW FOR COPYING
        instructions: [
          "⚠️ SAVE THIS TOKEN NOW ⚠️",
          "1. Copy and store it securely (password manager recommended)",
          "2. This token is your password - you WILL need it to login",
          "3. It will NOT be shown again",
          "4. If lost, you cannot recover your account",
        ],
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to register user",
      message: error.message,
    });
  }
};

/**
 * @desc    Login user with access token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { accessToken } = req.body;

    // Validate input
    if (!accessToken || accessToken.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Access token is required",
      });
    }

    // Find user by access token
    const user = await User.findOne({ accessToken: accessToken.trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid access token",
        message:
          "No user found with this token. Please check your token or register.",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Account deactivated",
        message: "This account has been deactivated",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.cookie("pocketledger_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });

    // Return user data (excluding sensitive fields)
    res.json({
      success: true,
      message: "Login successful. You are now logged in via secure cookie.",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          preferences: user.preferences,
          stats: user.stats,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
        cookieInfo: "Secure HttpOnly cookie set for 30 days",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
      message: error.message,
    });
  }
};

/**
 * @desc    Setup user profile (username & avatar)
 * @route   POST /api/auth/setup-profile
 * @access  Private (User must have valid token)
 */
const setupProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const userId = req.user?._id; // From auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Validate input
    if (!username || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Username is required",
      });
    }

    // Check username availability
    const isAvailable = await User.isUsernameAvailable(username);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        error: "Username taken",
        message: "This username is already taken. Please choose another.",
      });
    }

    // Validate avatar (must be from preset list)
    const validAvatars = [
      '👤', '😊', '😎', '🤖', '🐱', '🦊', '🐶', '🦁', '🐯', '🐼',
      '🐵', '🦄', '🐙', '🦉', '🐳', '🌈', '🎯', '🚀', '🎨', '🎮',
      '🍕', '☕', '🎸', '📚', '⚽', '🎭', '💎', '🌟', '🔥', '💧'
    ];
    const selectedAvatar = validAvatars.includes(avatar) ? avatar : "👤";

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username: username.trim(),
        avatar: selectedAvatar,
        $unset: { needsProfileSetup: 1 }, // Remove flag if exists
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile setup completed",
      data: {
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          avatar: updatedUser.avatar,
          preferences: updatedUser.preferences,
        },
      },
    });
  } catch (error) {
    console.error("Profile setup error:", error);
    res.status(500).json({
      success: false,
      error: "Profile setup failed",
      message: error.message,
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const user = await User.findById(userId)
      .select("-hashedAccessToken -__v")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          needsProfileSetup:
            !user.username || user.username.startsWith("user_"),
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
      message: error.message,
    });
  }
};

/**
 * @desc    Update user preferences
 * @route   PUT /api/auth/preferences
 * @access  Private
 */
const updatePreferences = async (req, res) => {
  try {
    const { theme, currency } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const updateData = {};

    // Validate and add theme if provided
    if (theme) {
      const validThemes = ["light", "dark", "system"];
      if (validThemes.includes(theme)) {
        updateData["preferences.theme"] = theme;
      }
    }

    // Validate and add currency if provided
    if (currency) {
      if (typeof currency === "string" && currency.length <= 5) {
        updateData["preferences.currency"] = currency;
      }
    }

    // If no valid updates
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid preferences to update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-hashedAccessToken -__v");

    res.json({
      success: true,
      message: "Preferences updated",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update preferences",
      message: error.message,
    });
  }
};

/**
 * @desc    Logout user (client-side only, but provides endpoint)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  res.clearCookie("pocketledger_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  res.json({
    success: true,
    message: "Logged out successfully. Secure cookie cleared.",
    instructions: "To login again, use your saved access token.",
  });
};
/**
 * @desc    Validate access token
 * @route   POST /api/auth/validate-token
 * @access  Private
 */
const validateToken = async (req, res) => {
  try {
    const token = req.cookies.pocketledger_token;

    if (!token) {
      return res.json({
        success: false,
        isAuthenticated: false,
        message: "No active session",
      });
    }

    const user = await User.findOne({ accessToken: accessToken.trim() });

    if (!user) {
      // Clear invalid cookie
      res.clearCookie("pocketledger_token");
      return res.json({
        success: false,
        isAuthenticated: false,
        message: "Invalid token",
      });
    }

    res.json({
      success: true,
      valid: true,
      message: "Token is valid",
      data: {
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
        preferences: user.preferences
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({
      success: false,
      valid: false,
      error: "Token validation failed",
    });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/account
 * @access  Private
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { confirmation } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Require confirmation
    if (confirmation !== "DELETE MY ACCOUNT") {
      return res.status(400).json({
        success: false,
        error: "Confirmation required",
        message: 'Please type "DELETE MY ACCOUNT" to confirm',
      });
    }

    // Find user first to get stats
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Delete user (cascade delete sections and bills will be handled)
    await User.findByIdAndDelete(userId);

    // Note: In production, you might want to soft delete or archive

    res.json({
      success: true,
      message: "Account deleted successfully",
      data: {
        deletedAt: new Date(),
        userId: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete account",
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  setupProfile,
  getProfile,
  updatePreferences,
  logout,
  validateToken,
  deleteAccount,
};
