const { bucket } = require('../firebase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Upload file to Firebase Storage
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: "No file provided" });
    }

    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const folderPath = req.body.folder || 'uploads';
    const filePath = `${folderPath}/${fileName}`;
    
    // Create a temporary file
    const tempFilePath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(tempFilePath, req.file.buffer);
    
    // Upload to Firebase Storage
    await bucket.upload(tempFilePath, {
      destination: filePath,
      metadata: {
        contentType: req.file.mimetype,
      },
    });
    
    // Delete the temporary file
    fs.unlinkSync(tempFilePath);
    
    // Get the public URL
    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future expiration
    });
    
    res.status(200).json({
      success: true,
      fileName,
      filePath,
      url,
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: true, message: "File upload failed" });
  }
};

// Get file from Firebase Storage
exports.getFile = async (req, res) => {
  try {
    const { filePath } = req.params;
    
    if (!filePath) {
      return res.status(400).json({ error: true, message: "File path is required" });
    }
    
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ error: true, message: "File not found" });
    }
    
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future expiration
    });
    
    res.status(200).json({
      success: true,
      url,
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: true, message: "Failed to get file" });
  }
};

// Delete file from Firebase Storage
exports.deleteFile = async (req, res) => {
  try {
    const { filePath } = req.params;
    
    if (!filePath) {
      return res.status(400).json({ error: true, message: "File path is required" });
    }
    
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ error: true, message: "File not found" });
    }
    
    await file.delete();
    
    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: true, message: "Failed to delete file" });
  }
};

// List files in a folder
exports.listFiles = async (req, res) => {
  try {
    const { folderPath } = req.params;
    
    if (!folderPath) {
      return res.status(400).json({ error: true, message: "Folder path is required" });
    }
    
    const [files] = await bucket.getFiles({ prefix: folderPath });
    
    const fileList = await Promise.all(files.map(async (file) => {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500', // Far future expiration
      });
      
      return {
        name: file.name,
        url,
        contentType: file.metadata.contentType,
        size: file.metadata.size,
        updated: file.metadata.updated,
      };
    }));
    
    res.status(200).json({
      success: true,
      files: fileList,
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: true, message: "Failed to list files" });
  }
};
