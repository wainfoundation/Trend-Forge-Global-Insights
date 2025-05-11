const express = require('express');
const router = express.Router();
const multer = require('multer');
const storageController = require('../controllers/storageController');
const authMiddleware = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload file route (protected)
router.post('/upload', authMiddleware, upload.single('file'), storageController.uploadFile);

// Get file route (public)
router.get('/:filePath', storageController.getFile);

// Delete file route (protected)
router.delete('/:filePath', authMiddleware, storageController.deleteFile);

// List files in a folder route (protected)
router.get('/list/:folderPath', authMiddleware, storageController.listFiles);

module.exports = router;
