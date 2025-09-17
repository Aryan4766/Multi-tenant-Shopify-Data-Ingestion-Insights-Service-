require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenant');
const syncRoutes = require('./routes/sync');
const analyticsRoutes = require('./routes/analytics');

const app = express();
let PORT = parseInt(process.env.PORT, 10) || 5000;
const SHOULD_SYNC = (process.env.DB_SYNC === 'true') || (process.env.NODE_ENV === 'development');

// Security middleware
app.use(helmet());
// Flexible CORS: allow single origin via CLIENT_URL or comma-separated list via ALLOWED_ORIGINS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed from this origin'));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection and server startup
async function startServer() {
  // Start server first so platform detects the port, then init DB in background
  const startListening = (portToTry) => {
    const server = app
      .listen(portToTry, () => {
        PORT = portToTry;
        logger.info(`Server running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      })
      .on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
          const nextPort = portToTry + 1;
          logger.error(`Port ${portToTry} in use, retrying on ${nextPort}...`);
          startListening(nextPort);
        } else {
          logger.error('Failed to bind server port:', err);
          process.exit(1);
        }
      });
    return server;
  };

  startListening(PORT);

  // Initialize database asynchronously
  (async () => {
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully');

      if (SHOULD_SYNC) {
        await sequelize.sync();
        logger.info('Database synchronized');
      }
    } catch (error) {
      // Do not crash the server; log and keep serving health/errors
      logger.error('Database initialization failed:', error);
    }
  })();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

startServer();
