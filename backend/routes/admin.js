const express = require('express');
const router = express.Router();
const { 
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getJournalistApplications,
  approveJournalistApplication,
  rejectJournalistApplication,
  getSiteStats,
  updateSiteSettings
} = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

// Apply authentication middleware to all admin routes
router.use(authenticateAdmin);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Journalist application routes
router.get('/journalist-applications', getJournalistApplications);
router.put('/journalist-applications/:id/approve', approveJournalistApplication);
router.put('/journalist-applications/:id/reject', rejectJournalistApplication);

// Site management routes
router.get('/stats', getSiteStats);
router.put('/settings', updateSiteSettings);

module.exports = router;
