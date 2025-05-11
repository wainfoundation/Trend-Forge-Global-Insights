const { admin, db, isFirebaseInitialized } = require('../firebase');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const xss = require('xss-clean');
const helmet = require('helmet');
const cors = require('cors');

// Create rate limiter
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, message: "Too many requests, please try again later" }
  });
};

// Security middleware
exports.securityMiddleware = [
  // Set security headers
  helmet(),
  // Prevent XSS attacks
  xss(),
  // CORS configuration
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
  }),
  // Rate limiting for all routes
  createRateLimiter(
    parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    parseInt(process.env.RATE_LIMIT_MAX) || 100
  )
];

// Authenticate user with enhanced security
exports.authenticate = async (req, res, next) => {
  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      return res.status(500).json({ error: true, message: "Authentication service unavailable" });
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: true, message: "Authentication required" });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token || token.length < 10) {
      return res.status(401).json({ error: true, message: "Invalid token format" });
    }
    
    try {
      // Verify token with short expiration
      const decodedToken = await admin.auth().verifyIdToken(token, true);
      
      // Check token expiration
      const tokenExp = decodedToken.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (tokenExp < now) {
        return res.status(401).json({ error: true, message: "Token expired" });
      }
      
      // Get user data
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: true, message: "User not found" });
      }
      
      const userData = userDoc.data();
      
      // Check if user is disabled
      if (userData.disabled) {
        return res.status(403).json({ error: true, message: "Account disabled" });
      }
      
      // Add user data to request
      req.user = {
        uid: decodedToken.uid,
        ...userData
      };
      
      // Update last active timestamp
      await db.collection('users').doc(decodedToken.uid).update({
        lastActive: admin.firestore.FieldValue.serverTimestamp()
      });
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: true, message: "Token expired" });
      } else if (error.code === 'auth/id-token-revoked') {
        return res.status(401).json({ error: true, message: "Token revoked" });
      } else if (error.code === 'auth/invalid-id-token') {
        return res.status(401).json({ error: true, message: "Invalid token" });
      } else {
        return res.status(401).json({ error: true, message: "Authentication failed" });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: true, message: "Authentication service error" });
  }
};

// Authenticate admin with enhanced security
exports.authenticateAdmin = async (req, res, next) => {
  try {
    await exports.authenticate(req, res, () => {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: true, message: "Access denied. Admin role required" });
      }
      
      // Log admin access
      console.log(`Admin access: ${req.user.uid} - ${req.method} ${req.originalUrl}`);
      
      next();
    });
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ error: true, message: "Authentication service error" });
  }
};

// Authenticate journalist with enhanced security
exports.authenticateJournalist = async (req, res, next) => {
  try {
    await exports.authenticate(req, res, () => {
      if (!req.user || (req.user.role !== 'journalist' && req.user.role !== 'admin')) {
        return res.status(403).json({ error: true, message: "Access denied. Journalist role required" });
      }
      
      next();
    });
  } catch (error) {
    console.error('Journalist authentication error:', error);
    res.status(500).json({ error: true, message: "Authentication service error" });
  }
};

// Validate request body
exports.validateRequest = (validations) => {
  return [
    // Apply validations
    ...validations,
    // Check for validation errors
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, message: "Validation failed", errors: errors.array() });
      }
      next();
    }
  ];
};

// Common validation rules
exports.validationRules = {
  login: [
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('password').optional().isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('piToken').optional().isString().withMessage('Invalid Pi token')
  ],
  register: [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('name').isString().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
  ],
  article: [
    body('title').isString().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
    body('content').isString().trim().isLength({ min: 100 }).withMessage('Content must be at least 100 characters'),
    body('categoryId').isString().withMessage('Category ID is required'),
    body('isPremium').isBoolean().withMessage('isPremium must be a boolean')
  ]
};

// Rate limiters for specific routes
exports.rateLimiters = {
  login: createRateLimiter(15 * 60 * 1000, 5), // 5 requests per 15 minutes
  register: createRateLimiter(60 * 60 * 1000, 3), // 3 requests per hour
  passwordReset: createRateLimiter(60 * 60 * 1000, 3), // 3 requests per hour
  api: createRateLimiter(15 * 60 * 1000, 100) // 100 requests per 15 minutes
};
