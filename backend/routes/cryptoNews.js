const express = require('express');
const router = express.Router();
const cryptoNewsController = require('../controllers/cryptoNewsController');

// Get latest crypto news
router.get('/latest', cryptoNewsController.getLatestNews);

// Get news by category
router.get('/category/:category', cryptoNewsController.getNewsByCategory);

// Get available categories
router.get('/categories', cryptoNewsController.getCategories);

// Search news by term
router.get('/search', cryptoNewsController.searchNews);

// Get Pi Network price data
router.get('/pi-price', cryptoNewsController.getPiPrice);

module.exports = router;
