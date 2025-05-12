const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const { createExpressMiddleware } = require('@trpc/server/adapters/express');
const { appRouter } = require('./trpc/app-router');
const { createContext } = require('./trpc/create-context');
const authRoutes = require('./routes/auth');
const journalistRoutes = require('./routes/journalist');
const adminRoutes = require('./routes/admin');
const articlesRoutes = require('./routes/articles');
const storageRoutes = require('./routes/storage');
const cryptoNewsRoutes = require('./routes/cryptoNews');
const { securityMiddleware } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet()); // Set security headers
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: "Too many requests, please try again later" }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

// Body parsing middleware
app.use(express.json({ limit: '10kb' })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Apply security middleware to all routes
app.use(securityMiddleware);

// API Routes with specific rate limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: "Too many login attempts, please try again later" }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/journalist', journalistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/crypto-news', cryptoNewsRoutes);

// tRPC with security middleware
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong' 
    : err.message || 'Something went wrong';
  
  res.status(err.statusCode || 500).json({
    error: true,
    message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: true, message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
