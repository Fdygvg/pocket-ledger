const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const { authLimiter, apiLimiter } = require('./src/config/rateLimit');
const authRoutes = require('./src/routes/auth.routes');
const sectionRoutes = require('./src/routes/section.routes');
const billRoutes = require('./src/routes/bill.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================
// Cookie Security
// ========================
app.use(cookieParser());


// ========================
// Middleware Configuration
// ========================

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
    'https://pocketledger-gray.vercel.app',
    'https://pocketledger.vercel.app',
  ]
  : [
    'http://localhost:5173',
    'http://localhost:6173',
    'http://127.0.0.1:5173',
  ];



app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

// ========================
// Database Connection
// ========================
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI)


    console.log('✅ MongoDB Connected Successfully');
    console.log(`📁 Database: ${mongoose.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.log('📝 Please check:');
    console.log('   1. Is MongoDB running locally? (mongod)');
    console.log('   2. Is the MONGODB_URI correct in your .env file?');
    console.log('   3. For Atlas: Check network access and credentials');
    process.exit(1);
  }
};

// ========================
// API Routes
// ========================

// Authentication Routes (Rate Limited)
app.use('/api/auth', authLimiter, authRoutes);

// Protected Feature Routes (General API Rate Limit)
app.use('/api/sections', apiLimiter, sectionRoutes);
app.use('/api/bills', apiLimiter, billRoutes);

// ========================
// Utility Routes
// ========================
app.get('/', (req, res) => {
  res.json({
    app: 'PocketLedger API',
    version: '1.0.0',
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      sections: {
        list: 'GET /api/sections',
        create: 'POST /api/sections'
      },
      bills: {
        list: 'GET /api/bills'
      }
    }
  });
});

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const status = dbStatus === 1 ? 'healthy' : 'unhealthy';

  res.status(dbStatus === 1 ? 200 : 503).json({
    status: status,
    database: {
      state: dbStatus,
      description: getDBStateDescription(dbStatus)
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

function getDBStateDescription(state) {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[state] || 'unknown';
}



// ========================
// Error Handler
// ========================
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ========================
// Server Initialization
// ========================
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 PocketLedger Server Started Successfully');
      console.log('='.repeat(50));
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Local: http://localhost:${PORT}`);
      console.log(`📊 Database: ${mongoose.connection.host}/${mongoose.connection.name}`);
      console.log('='.repeat(50) + '\n');

      console.log('✅ Available Endpoints:');
      console.log(`   GET  /              - API Info`);
      console.log(`   GET  /health        - Health check`);
      console.log(`   POST /api/auth/register - Register user`);
      console.log(`   POST /api/auth/login    - Login user`);
      console.log(`   GET  /api/sections  - List sections`);
      console.log(`   POST /api/sections  - Create section`);
      console.log(`   GET  /api/bills     - List bills`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for testing if needed
module.exports = app;