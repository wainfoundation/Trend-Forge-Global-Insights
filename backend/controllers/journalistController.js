const { db, bucket, admin } = require('../firebase');
const path = require('path');

// Get journalist profile
exports.getJournalistProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: true, message: "Journalist not found" });
    }
    
    const userData = userDoc.data();
    
    // Check if user is a journalist
    if (userData.role !== 'journalist') {
      return res.status(403).json({ error: true, message: "Access denied. User is not a journalist" });
    }
    
    // Remove sensitive data
    delete userData.password;
    
    res.status(200).json({
      id: userDoc.id,
      ...userData
    });
    
  } catch (error) {
    console.error('Get journalist profile error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch journalist profile" });
  }
};

// Update journalist profile
exports.updateJournalistProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, bio, expertise, socialLinks } = req.body;
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: true, message: "Journalist not found" });
    }
    
    const userData = userDoc.data();
    
    // Check if user is a journalist
    if (userData.role !== 'journalist') {
      return res.status(403).json({ error: true, message: "Access denied. User is not a journalist" });
    }
    
    // Update profile
    const updateData = {};
    
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (expertise) updateData.expertise = expertise;
    if (socialLinks) updateData.socialLinks = socialLinks;
    
    await db.collection('users').doc(userId).update(updateData);
    
    res.status(200).json({
      id: userDoc.id,
      ...userData,
      ...updateData
    });
    
  } catch (error) {
    console.error('Update journalist profile error:', error);
    res.status(500).json({ error: true, message: "Failed to update journalist profile" });
  }
};

// Get journalist articles
exports.getJournalistArticles = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { status, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    // Build query
    let articlesQuery = db.collection('articles')
      .where('authorId', '==', userId)
      .orderBy('publishedAt', 'desc');
    
    // Filter by status if provided
    if (status) {
      articlesQuery = articlesQuery.where('status', '==', status);
    }
    
    // Apply pagination
    articlesQuery = articlesQuery.limit(limitNumber);
    
    if (pageNumber > 1) {
      const lastDoc = await db.collection('articles')
        .where('authorId', '==', userId)
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
    let countQuery = db.collection('articles').where('authorId', '==', userId);
    if (status) {
      countQuery = countQuery.where('status', '==', status);
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
    console.error('Get journalist articles error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch journalist articles" });
  }
};

// Submit new article
exports.submitArticle = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, summary, content, category, imageUrl, tags, isPremium } = req.body;
    
    // Validate required fields
    if (!title || !summary || !content || !category) {
      return res.status(400).json({ error: true, message: "Title, summary, content, and category are required" });
    }
    
    // Get journalist data
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: true, message: "Journalist not found" });
    }
    
    const userData = userDoc.data();
    
    // Check if user is a journalist
    if (userData.role !== 'journalist') {
      return res.status(403).json({ error: true, message: "Access denied. User is not a journalist" });
    }
    
    // Create new article
    const newArticle = {
      title,
      summary,
      content,
      category,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
      status: 'pending', // All new articles start as pending
      publishedAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      authorId: userId,
      authorName: userData.name,
      views: 0,
      likes: 0,
      comments: 0,
      isPremium: !!isPremium,
      featured: false,
      tags: tags || []
    };
    
    const articleRef = await db.collection('articles').add(newArticle);
    
    res.status(201).json({
      id: articleRef.id,
      ...newArticle,
      createdAt: new Date().toISOString(), // Convert server timestamp to ISO string for response
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Submit article error:', error);
    res.status(500).json({ error: true, message: "Failed to submit article" });
  }
};

// Update article
exports.updateArticle = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { title, summary, content, category, imageUrl, tags, isPremium } = req.body;
    
    // Get article
    const articleDoc = await db.collection('articles').doc(id).get();
    
    if (!articleDoc.exists) {
      return res.status(404).json({ error: true, message: "Article not found" });
    }
    
    const articleData = articleDoc.data();
    
    // Check if user is the author
    if (articleData.authorId !== userId) {
      return res.status(403).json({ error: true, message: "Access denied. You are not the author of this article" });
    }
    
    // Check if article is published
    if (articleData.status === 'published') {
      return res.status(400).json({ error: true, message: "Cannot update a published article" });
    }
    
    // Update article
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (title) updateData.title = title;
    if (summary) updateData.summary = summary;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (tags) updateData.tags = tags;
    if (isPremium !== undefined) updateData.isPremium = !!isPremium;
    
    await db.collection('articles').doc(id).update(updateData);
    
    res.status(200).json({
      id,
      ...articleData,
      ...updateData,
      updatedAt: new Date().toISOString() // Convert server timestamp to ISO string for response
    });
    
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: true, message: "Failed to update article" });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    // Get article
    const articleDoc = await db.collection('articles').doc(id).get();
    
    if (!articleDoc.exists) {
      return res.status(404).json({ error: true, message: "Article not found" });
    }
    
    const articleData = articleDoc.data();
    
    // Check if user is the author
    if (articleData.authorId !== userId) {
      return res.status(403).json({ error: true, message: "Access denied. You are not the author of this article" });
    }
    
    // Delete article
    await db.collection('articles').doc(id).delete();
    
    res.status(200).json({ message: "Article deleted successfully" });
    
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: true, message: "Failed to delete article" });
  }
};

// Get journalist earnings
exports.getJournalistEarnings = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get journalist data
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: true, message: "Journalist not found" });
    }
    
    // Get earnings data
    const earningsSnapshot = await db.collection('earnings')
      .where('journalistId', '==', userId)
      .orderBy('date', 'desc')
      .get();
    
    const earnings = earningsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate total earnings
    const totalEarnings = earnings.reduce((total, earning) => total + earning.amount, 0);
    
    // Get article stats
    const articlesSnapshot = await db.collection('articles')
      .where('authorId', '==', userId)
      .where('status', '==', 'published')
      .get();
    
    const totalArticles = articlesSnapshot.size;
    const totalViews = articlesSnapshot.docs.reduce((total, doc) => total + (doc.data().views || 0), 0);
    const totalLikes = articlesSnapshot.docs.reduce((total, doc) => total + (doc.data().likes || 0), 0);
    
    res.status(200).json({
      earnings,
      stats: {
        totalEarnings,
        totalArticles,
        totalViews,
        totalLikes
      }
    });
    
  } catch (error) {
    console.error('Get journalist earnings error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch journalist earnings" });
  }
};
