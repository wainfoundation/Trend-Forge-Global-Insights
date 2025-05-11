const { db, admin } = require('../firebase');

// Get articles with pagination and filters
exports.getArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, author, status = 'published' } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    // Build query
    let articlesQuery = db.collection('articles')
      .where('status', '==', status)
      .orderBy('publishedAt', 'desc');
    
    // Apply filters
    if (category) {
      articlesQuery = articlesQuery.where('category', '==', category);
    }
    
    if (tag) {
      articlesQuery = articlesQuery.where('tags', 'array-contains', tag);
    }
    
    if (author) {
      articlesQuery = articlesQuery.where('authorId', '==', author);
    }
    
    // Apply pagination
    articlesQuery = articlesQuery.limit(limitNumber);
    
    if (pageNumber > 1) {
      const lastDoc = await db.collection('articles')
        .where('status', '==', status)
        .orderBy('publishedAt', 'desc')
        .limit((pageNumber - 1) * limitNumber)
        .get()
        .then(snapshot => snapshot.docs[snapshot.docs.length - 1]);
      
      if (lastDoc) {
        articlesQuery = articlesQuery.startAfter(lastDoc);
      }
    }
    
    const articlesSnapshot = await articlesQuery.get();
    
    // Get total count for pagination
    let countQuery = db.collection('articles').where('status', '==', status);
    
    if (category) {
      countQuery = countQuery.where('category', '==', category);
    }
    
    if (tag) {
      countQuery = countQuery.where('tags', 'array-contains', tag);
    }
    
    if (author) {
      countQuery = countQuery.where('authorId', '==', author);
    }
    
    const totalCount = await countQuery.count().get().then(snapshot => snapshot.data().count);
    
    const articles = articlesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      articles,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalCount / limitNumber)
      }
    });
    
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch articles" });
  }
};

// Get article by ID
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const articleDoc = await db.collection('articles').doc(id).get();
    
    if (!articleDoc.exists) {
      return res.status(404).json({ error: true, message: "Article not found" });
    }
    
    const articleData = articleDoc.data();
    
    // Check if article is published
    if (articleData.status !== 'published') {
      // If user is authenticated and is the author or an admin, allow access
      if (req.user && (req.user.uid === articleData.authorId || req.user.role === 'admin')) {
        return res.status(200).json({
          id: articleDoc.id,
          ...articleData
        });
      }
      
      return res.status(403).json({ error: true, message: "Article is not published" });
    }
    
    // Get author data
    const authorDoc = await db.collection('users').doc(articleData.authorId).get();
    let authorData = null;
    
    if (authorDoc.exists) {
      const author = authorDoc.data();
      // Remove sensitive data
      delete author.password;
      
      authorData = {
        id: authorDoc.id,
        ...author
      };
    }
    
    res.status(200).json({
      id: articleDoc.id,
      ...articleData,
      author: authorData
    });
    
  } catch (error) {
    console.error('Get article by ID error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch article" });
  }
};

// Get featured articles
exports.getFeaturedArticles = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const limitNumber = parseInt(limit);
    
    const articlesSnapshot = await db.collection('articles')
      .where('status', '==', 'published')
      .where('featured', '==', true)
      .orderBy('publishedAt', 'desc')
      .limit(limitNumber)
      .get();
    
    const articles = articlesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(articles);
    
  } catch (error) {
    console.error('Get featured articles error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch featured articles" });
  }
};

// Get articles by category
exports.getArticlesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    // Build query
    let articlesQuery = db.collection('articles')
      .where('status', '==', 'published')
      .where('category', '==', category)
      .orderBy('publishedAt', 'desc')
      .limit(limitNumber);
    
    if (pageNumber > 1) {
      const lastDoc = await db.collection('articles')
        .where('status', '==', 'published')
        .where('category', '==', category)
        .orderBy('publishedAt', 'desc')
        .limit((pageNumber - 1) * limitNumber)
        .get()
        .then(snapshot => snapshot.docs[snapshot.docs.length - 1]);
      
      if (lastDoc) {
        articlesQuery = articlesQuery.startAfter(lastDoc);
      }
    }
    
    const articlesSnapshot = await articlesQuery.get();
    
    // Get total count for pagination
    const totalCount = await db.collection('articles')
      .where('status', '==', 'published')
      .where('category', '==', category)
      .count()
      .get()
      .then(snapshot => snapshot.data().count);
    
    const articles = articlesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      articles,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalCount / limitNumber)
      }
    });
    
  } catch (error) {
    console.error('Get articles by category error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch articles by category" });
  }
};

// Get articles by tag
exports.getArticlesByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    // Build query
    let articlesQuery = db.collection('articles')
      .where('status', '==', 'published')
      .where('tags', 'array-contains', tag)
      .orderBy('publishedAt', 'desc')
      .limit(limitNumber);
    
    if (pageNumber > 1) {
      const lastDoc = await db.collection('articles')
        .where('status', '==', 'published')
        .where('tags', 'array-contains', tag)
        .orderBy('publishedAt', 'desc')
        .limit((pageNumber - 1) * limitNumber)
        .get()
        .then(snapshot => snapshot.docs[snapshot.docs.length - 1]);
      
      if (lastDoc) {
        articlesQuery = articlesQuery.startAfter(lastDoc);
      }
    }
    
    const articlesSnapshot = await articlesQuery.get();
    
    // Get total count for pagination
    const totalCount = await db.collection('articles')
      .where('status', '==', 'published')
      .where('tags', 'array-contains', tag)
      .count()
      .get()
      .then(snapshot => snapshot.data().count);
    
    const articles = articlesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      articles,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalCount / limitNumber)
      }
    });
    
  } catch (error) {
    console.error('Get articles by tag error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch articles by tag" });
  }
};

// Search articles
exports.searchArticles = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    if (!q) {
      return res.status(400).json({ error: true, message: "Search query is required" });
    }
    
    // For a real search implementation, you would use Algolia, Elasticsearch, or Firebase's full-text search
    // For this demo, we'll do a simple search on title and content
    
    // Get all published articles
    const articlesSnapshot = await db.collection('articles')
      .where('status', '==', 'published')
      .get();
    
    // Filter articles by search query
    const searchQuery = q.toLowerCase();
    const matchedArticles = articlesSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(article => 
        article.title.toLowerCase().includes(searchQuery) || 
        article.content.toLowerCase().includes(searchQuery) ||
        article.summary.toLowerCase().includes(searchQuery) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchQuery)))
      );
    
    // Apply pagination
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;
    const paginatedArticles = matchedArticles.slice(startIndex, endIndex);
    
    res.status(200).json({
      articles: paginatedArticles,
      pagination: {
        total: matchedArticles.length,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(matchedArticles.length / limitNumber)
      }
    });
    
  } catch (error) {
    console.error('Search articles error:', error);
    res.status(500).json({ error: true, message: "Failed to search articles" });
  }
};

// Like article
exports.likeArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const articleDoc = await db.collection('articles').doc(id).get();
    
    if (!articleDoc.exists) {
      return res.status(404).json({ error: true, message: "Article not found" });
    }
    
    // Check if user already liked the article
    const likeDoc = await db.collection('likes')
      .where('articleId', '==', id)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (!likeDoc.empty) {
      return res.status(400).json({ error: true, message: "You already liked this article" });
    }
    
    // Add like
    await db.collection('likes').add({
      articleId: id,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update article likes count
    await db.collection('articles').doc(id).update({
      likes: admin.firestore.FieldValue.increment(1)
    });
    
    res.status(200).json({ message: "Article liked successfully" });
    
  } catch (error) {
    console.error('Like article error:', error);
    res.status(500).json({ error: true, message: "Failed to like article" });
  }
};

// View article
exports.viewArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const articleDoc = await db.collection('articles').doc(id).get();
    
    if (!articleDoc.exists) {
      return res.status(404).json({ error: true, message: "Article not found" });
    }
    
    // Check if user already viewed the article in the last 24 hours
    const viewDoc = await db.collection('views')
      .where('articleId', '==', id)
      .where('userId', '==', userId)
      .where('createdAt', '>', admin.firestore.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)))
      .limit(1)
      .get();
    
    if (!viewDoc.empty) {
      return res.status(200).json({ message: "View already recorded" });
    }
    
    // Add view
    await db.collection('views').add({
      articleId: id,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update article views count
    await db.collection('articles').doc(id).update({
      views: admin.firestore.FieldValue.increment(1)
    });
    
    // Add to reading history
    await db.collection('reading_history').add({
      articleId: id,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({ message: "View recorded successfully" });
    
  } catch (error) {
    console.error('View article error:', error);
    res.status(500).json({ error: true, message: "Failed to record view" });
  }
};

// Comment on article
exports.commentOnArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.uid;
    
    if (!content) {
      return res.status(400).json({ error: true, message: "Comment content is required" });
    }
    
    const articleDoc = await db.collection('articles').doc(id).get();
    
    if (!articleDoc.exists) {
      return res.status(404).json({ error: true, message: "Article not found" });
    }
    
    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    
    const userData = userDoc.data();
    
    // Add comment
    const commentRef = await db.collection('comments').add({
      articleId: id,
      userId,
      userName: userData.name,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update article comments count
    await db.collection('articles').doc(id).update({
      comments: admin.firestore.FieldValue.increment(1)
    });
    
    res.status(201).json({
      id: commentRef.id,
      articleId: id,
      userId,
      userName: userData.name,
      content,
      createdAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Comment on article error:', error);
    res.status(500).json({ error: true, message: "Failed to add comment" });
  }
};

// Get article comments
exports.getArticleComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const articleDoc = await db.collection('articles').doc(id).get();
    
    if (!articleDoc.exists) {
      return res.status(404).json({ error: true, message: "Article not found" });
    }
    
    // Build query
    let commentsQuery = db.collection('comments')
      .where('articleId', '==', id)
      .orderBy('createdAt', 'desc')
      .limit(limitNumber);
    
    if (pageNumber > 1) {
      const lastDoc = await db.collection('comments')
        .where('articleId', '==', id)
        .orderBy('createdAt', 'desc')
        .limit((pageNumber - 1) * limitNumber)
        .get()
        .then(snapshot => snapshot.docs[snapshot.docs.length - 1]);
      
      if (lastDoc) {
        commentsQuery = commentsQuery.startAfter(lastDoc);
      }
    }
    
    const commentsSnapshot = await commentsQuery.get();
    
    // Get total count for pagination
    const totalCount = await db.collection('comments')
      .where('articleId', '==', id)
      .count()
      .get()
      .then(snapshot => snapshot.data().count);
    
    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({
      comments,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalCount / limitNumber)
      }
    });
    
  } catch (error) {
    console.error('Get article comments error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch comments" });
  }
};
