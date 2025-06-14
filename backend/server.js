const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database configuration
const { sequelize, testConnection } = require('./config/database');

// Import routes
const apiRoutes = require('./routes/index');

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Instructo API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Database connection errors
  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
    });
  }
  
  // Validation errors
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors.map(err => err.message),
    });
  }
  
  // Unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Resource already exists',
      errors: error.errors.map(err => `${err.path} must be unique`),
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }
  
  // File upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large',
    });
  }
  
  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ 
      force: false, // Set to true only for development if you want to recreate tables
      alter: process.env.NODE_ENV === 'development' // Alter tables in development
    });
    console.log('✅ Database models synced successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Instructo API Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💓 Health Check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('📋 Available API Routes:');
      console.log('  Authentication:');
      console.log('    POST /api/auth/login');
      console.log('    POST /api/auth/send-otp');
      console.log('    POST /api/auth/verify-otp');
      console.log('    POST /api/auth/logout');
      console.log('    POST /api/auth/refresh');
      console.log('');
      console.log('  Admin Routes:');
      console.log('    GET  /api/admin/dashboard');
      console.log('    GET  /api/admin/admins');
      console.log('    POST /api/admin/admins');
      console.log('    PUT  /api/admin/admins/:id');
      console.log('    DELETE /api/admin/admins/:id');
      console.log('    GET  /api/admin/instructors');
      console.log('    POST /api/admin/instructors');
      console.log('    PUT  /api/admin/instructors/:id');
      console.log('    GET  /api/admin/trainees/pending');
      console.log('    PUT  /api/admin/trainees/:id/approve');
      console.log('    GET  /api/admin/progress-reviews');
      console.log('    PUT  /api/admin/progress-reviews/:id');
      console.log('');
      console.log('  Instructor Routes:');
      console.log('    GET  /api/instructor/dashboard');
      console.log('    GET  /api/instructor/trainees');
      console.log('    POST /api/instructor/trainees');
      console.log('    PUT  /api/instructor/trainees/:id');
      console.log('    GET  /api/instructor/projects');
      console.log('    POST /api/instructor/projects');
      console.log('    PUT  /api/instructor/projects/:id');
      console.log('    PUT  /api/instructor/projects/:id/complete');
      console.log('    POST /api/instructor/progress');
      console.log('    POST /api/instructor/documents/upload');
      console.log('    GET  /api/instructor/documents');
      console.log('    POST /api/instructor/attendance/upload');
      console.log('    GET  /api/instructor/monthly-status');
      console.log('    POST /api/instructor/share-progress');
      console.log('');
      console.log('  Shared Routes:');
      console.log('    GET  /api/notifications');
      console.log('    PUT  /api/notifications/:id/read');
      console.log('    POST /api/notifications');
      console.log('    GET  /api/profile');
      console.log('    PUT  /api/profile');
      console.log('    GET  /api/file/:id');
      console.log('');
      console.log('🎯 Ready to serve requests!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Initialize server
startServer();

module.exports = app;
