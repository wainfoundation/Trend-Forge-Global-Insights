const express = require('express');
const router = express.Router();
const { login, register, verifyToken } = require('../controllers/authController');

// Login route
router.post('/login', login);

// Register route
router.post('/register', register);

// Verify token route
router.post('/verify', verifyToken);

module.exports = router;
