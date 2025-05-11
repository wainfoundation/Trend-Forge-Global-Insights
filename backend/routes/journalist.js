const express = require('express');
const router = express.Router();
const { 
  getJournalistProfile, 
  updateJournalistProfile,
  getJournalistArticles,
  submitArticle,
  updateArticle,
  deleteArticle,
  getJournalistEarnings
} = require('../controllers/journalistController');
const { authenticateJournalist } = require('../middleware/auth');

// Apply authentication middleware to all journalist routes
router.use(authenticateJournalist);

// Profile routes
router.get('/profile', getJournalistProfile);
router.put('/profile', updateJournalistProfile);

// Article routes
router.get('/articles', getJournalistArticles);
router.post('/articles', submitArticle);
router.put('/articles/:id', updateArticle);
router.delete('/articles/:id', deleteArticle);

// Earnings routes
router.get('/earnings', getJournalistEarnings);

module.exports = router;
