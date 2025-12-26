const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    service: 'Sugar Daddy User Service',
    status: 'running',
    version: '1.0.0',
    message: 'Simplified JavaScript version for testing'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'user-service',
    port: PORT
  });
});

// Database health check (simplified)
app.get('/health/db', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'not_configured',
    timestamp: new Date().toISOString(),
    message: 'Database connection not configured in simplified version'
  });
});

// Basic user endpoints for testing
app.get('/users/test', (req, res) => {
  res.json({
    success: true,
    message: 'User service is responding',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  console.log(`Service info available at: http://localhost:${PORT}/`);
  console.log(`Test endpoint available at: http://localhost:${PORT}/users/test`);
});

module.exports = app;