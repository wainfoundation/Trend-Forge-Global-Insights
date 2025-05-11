const { db, admin } = require('../firebase');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    // Build query
    let usersQuery = db.collection('users');
    
    // Filter by role if provided
    if (role) {
      usersQuery = usersQuery.where('role', '==', role);
    }
    
    // Apply pagination
    usersQuery = usersQuery.limit(limitNumber);
    
    if (pageNumber > 1) {
      const lastDoc = await db.collection('users')
        .limit((pageNumber - 1) * limitNumber)
        .get()
        .then(snapshot => snapshot.docs[snapshot.docs.length - 1]);
      
      if (lastDoc) {
        usersQuery = usersQuery.startAfter(lastDoc);
      }
    }
    
    const usersSnapshot = await usersQuery.get();
    
    // Get total count for pagination
    let countQuery = db.collection('users');
    if (role) {
      countQuery = countQuery.where('role', '==', role);
    }
    
    const totalCount = await countQuery.count().get().then(snapshot => snapshot.data().count);
    
    const users = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      // Remove sensitive data
      delete userData.password;
      
      return {
        id: doc.id,
        ...userData
      };
    });
    
    res.status(200).json({
      users,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalCount / limitNumber)
      }
    });
    
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch users" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userDoc = await db.collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    
    const userData = userDoc.data();
    
    // Remove sensitive data
    delete userData.password;
    
    res.status(200).json({
      id: userDoc.id,
      ...userData
    });
    
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch user" });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['public', 'journalist', 'admin'].includes(role)) {
      return res.status(400).json({ error: true, message: "Valid role is required" });
    }
    
    const userDoc = await db.collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    
    await db.collection('users').doc(id).update({ role });
    
    const userData = userDoc.data();
    
    // Remove sensitive data
    delete userData.password;
    
    res.status(200).json({
      id: userDoc.id,
      ...userData,
      role
    });
    
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: true, message: "Failed to update user role" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userDoc = await db.collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    
    // Delete user's articles if they are a journalist
    const userData = userDoc.data();
    if (userData.role === 'journalist') {
      const articlesSnapshot = await db.collection('articles')
        .where('authorId', '==', id)
        .get();
      
      const batch = db.batch();
      articlesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    }
    
    // Delete user
    await db.collection('users').doc(id).delete();
    
    res.status(200).json({ message: "User deleted successfully" });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: true, message: "Failed to delete user" });
  }
};

// Get journalist applications
exports.getJournalistApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    // Build query
    let applicationsQuery = db.collection('journalist_applications');
    
    // Filter by status if provided
    if (status) {
      applicationsQuery = applicationsQuery.where('status', '==', status);
    }
    
    // Apply pagination
    applicationsQuery = applicationsQuery.orderBy('createdAt', 'desc').limit(limitNumber);
    
    if (pageNumber > 1) {
      const lastDoc = await db.collection('journalist_applications')
        .orderBy('createdAt', 'desc')
        .limit((pageNumber - 1) * limitNumber)
        .get()
        .then(snapshot => snapshot.docs[snapshot.docs.length - 1]);
      
      if (lastDoc) {
        applicationsQuery = applicationsQuery.startAfter(lastDoc);
      }
    }
    
    const applicationsSnapshot = await applicationsQuery.get();
    
    // Get total count for pagination
    let countQuery = db.collection('journalist_applications');
    if (status) {
      countQuery = countQuery.where('status', '==', status);
    }
    
    const totalCount = await countQuery.count().get().then(snapshot => snapshot.data().count);
    
    const applications = [];
    
    for (const doc of applicationsSnapshot.docs) {
      const applicationData = doc.data();
      
      // Get user data
      let userData = null;
      if (applicationData.userId) {
        const userDoc = await db.collection('users').doc(applicationData.userId).get();
        if (userDoc.exists) {
          const user = userDoc.data();
          // Remove sensitive data
          delete user.password;
          
          userData = {
            id: userDoc.id,
            ...user
          };
        }
      }
      
      applications.push({
        id: doc.id,
        ...applicationData,
        user: userData
      });
    }
    
    res.status(200).json({
      applications,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalCount / limitNumber)
      }
    });
    
  } catch (error) {
    console.error('Get journalist applications error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch journalist applications" });
  }
};

// Approve journalist application
exports.approveJournalistApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    const applicationDoc = await db.collection('journalist_applications').doc(id).get();
    
    if (!applicationDoc.exists) {
      return res.status(404).json({ error: true, message: "Application not found" });
    }
    
    const applicationData = applicationDoc.data();
    
    // Check if application is already processed
    if (applicationData.status !== 'pending') {
      return res.status(400).json({ error: true, message: "Application is already processed" });
    }
    
    // Update application status
    await db.collection('journalist_applications').doc(id).update({
      status: 'approved',
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      processedBy: req.user.uid
    });
    
    // Update user role to journalist
    await db.collection('users').doc(applicationData.userId).update({
      role: 'journalist'
    });
    
    res.status(200).json({
      id,
      ...applicationData,
      status: 'approved',
      processedAt: new Date().toISOString(),
      processedBy: req.user.uid
    });
    
  } catch (error) {
    console.error('Approve journalist application error:', error);
    res.status(500).json({ error: true, message: "Failed to approve journalist application" });
  }
};

// Reject journalist application
exports.rejectJournalistApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: true, message: "Rejection reason is required" });
    }
    
    const applicationDoc = await db.collection('journalist_applications').doc(id).get();
    
    if (!applicationDoc.exists) {
      return res.status(404).json({ error: true, message: "Application not found" });
    }
    
    const applicationData = applicationDoc.data();
    
    // Check if application is already processed
    if (applicationData.status !== 'pending') {
      return res.status(400).json({ error: true, message: "Application is already processed" });
    }
    
    // Update application status
    await db.collection('journalist_applications').doc(id).update({
      status: 'rejected',
      rejectionReason: reason,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      processedBy: req.user.uid
    });
    
    res.status(200).json({
      id,
      ...applicationData,
      status: 'rejected',
      rejectionReason: reason,
      processedAt: new Date().toISOString(),
      processedBy: req.user.uid
    });
    
  } catch (error) {
    console.error('Reject journalist application error:', error);
    res.status(500).json({ error: true, message: "Failed to reject journalist application" });
  }
};

// Get site stats
exports.getSiteStats = async (req, res) => {
  try {
    // Get user stats
    const usersCount = await db.collection('users').count().get().then(snapshot => snapshot.data().count);
    const journalistsCount = await db.collection('users').where('role', '==', 'journalist').count().get().then(snapshot => snapshot.data().count);
    const adminsCount = await db.collection('users').where('role', '==', 'admin').count().get().then(snapshot => snapshot.data().count);
    
    // Get article stats
    const articlesCount = await db.collection('articles').count().get().then(snapshot => snapshot.data().count);
    const publishedArticlesCount = await db.collection('articles').where('status', '==', 'published').count().get().then(snapshot => snapshot.data().count);
    const pendingArticlesCount = await db.collection('articles').where('status', '==', 'pending').count().get().then(snapshot => snapshot.data().count);
    
    // Get subscription stats
    const premiumUsersCount = await db.collection('users').where('subscriptionPlan', '==', 'premium').count().get().then(snapshot => snapshot.data().count);
    const basicUsersCount = await db.collection('users').where('subscriptionPlan', '==', 'basic').count().get().then(snapshot => snapshot.data().count);
    
    // Get total views and likes
    const articlesSnapshot = await db.collection('articles').where('status', '==', 'published').get();
    const totalViews = articlesSnapshot.docs.reduce((total, doc) => total + (doc.data().views || 0), 0);
    const totalLikes = articlesSnapshot.docs.reduce((total, doc) => total + (doc.data().likes || 0), 0);
    
    res.status(200).json({
      users: {
        total: usersCount,
        journalists: journalistsCount,
        admins: adminsCount,
        premium: premiumUsersCount,
        basic: basicUsersCount
      },
      articles: {
        total: articlesCount,
        published: publishedArticlesCount,
        pending: pendingArticlesCount,
        views: totalViews,
        likes: totalLikes
      }
    });
    
  } catch (error) {
    console.error('Get site stats error:', error);
    res.status(500).json({ error: true, message: "Failed to fetch site stats" });
  }
};

// Update site settings
exports.updateSiteSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({ error: true, message: "Settings are required" });
    }
    
    // Get current settings
    const settingsDoc = await db.collection('settings').doc('site').get();
    
    if (!settingsDoc.exists) {
      // Create settings if not exists
      await db.collection('settings').doc('site').set({
        ...settings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: req.user.uid
      });
    } else {
      // Update existing settings
      await db.collection('settings').doc('site').update({
        ...settings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: req.user.uid
      });
    }
    
    res.status(200).json({
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    });
    
  } catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({ error: true, message: "Failed to update site settings" });
  }
};
