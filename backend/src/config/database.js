const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('❌ MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    
    return conn;
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n💡 Troubleshooting Tips:');
      console.log('   1. Is MongoDB running? Run: mongod');
      console.log('   2. For MongoDB Atlas: Check your IP whitelist');
      console.log('   3. Check your MONGODB_URI in .env file');
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Handle MongoDB connection events
 */
const setupDBListeners = () => {
  mongoose.connection.on('connected', () => {
    console.log('📊 MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB connection disconnected');
  });

  // Handle application termination
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed due to app termination');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed due to app termination');
    process.exit(0);
  });
};

/**
 * Check database connection status
 * @returns {Object} Connection status
 */
const getDBStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: state,
    status: states[state] || 'unknown',
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.connection.models)
  };
};

/**
 * Close database connection
 * @returns {Promise<void>}
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
};

module.exports = {
  connectDB,
  setupDBListeners,
  getDBStatus,
  closeDB,
  mongoose // Export mongoose for use in models
};