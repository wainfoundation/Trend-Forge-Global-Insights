const express = require('express');
const router = express.Router();
const { 
  getArticles,
  getArticleById,
  getFeaturedArticles,
  getArticlesByCategory,
  getArticlesByTag,
  searchArticles,
  likeArticle,
  viewArticle,
  commentOnArticle,
  getArticleComments
} = require('../controllers/articleController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', getArticles);
router.get('/featured', getFeaturedArticles);
router.get('/category/:category', getArticlesByCategory);
router.get('/tag/:tag', getArticlesByTag);
router.get('/search', searchArticles);
router.get('/:id', getArticleById);
router.get('/:id/comments', getArticleComments);

// Protected routes
router.post('/:id/like', authenticate, likeArticle);
router.post('/:id/view', authenticate, viewArticle);
router.post('/:id/comment', authenticate, commentOnArticle);

module.exports = router;
