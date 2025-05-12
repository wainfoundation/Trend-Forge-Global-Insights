const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  try {
    // Check if serviceAccountKey.json exists, otherwise use environment variables
    let credential;
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

    if (fs.existsSync(serviceAccountPath)) {
      try {
        const serviceAccount = require('./serviceAccountKey.json');
        credential = admin.credential.cert(serviceAccount);
      } catch (error) {
        console.error('Error loading service account file:', error);
        throw new Error('Invalid service account configuration');
      }
    } else {
      // Use environment variables if file doesn't exist
      console.log('Service account file not found, using environment variables');
      
      // Check if all required environment variables are present
      const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
        throw new Error('Missing required Firebase configuration');
      }
      
      // Use actual environment variables
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Make sure to properly handle newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      });
    }

    // Initialize admin with credential
    admin.initializeApp({
      credential: credential,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "trendforge-blog.appspot.com",
      // Add database URL if needed
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Don't throw here, as it would crash the server
    // Instead, we'll handle the error in the routes that use Firebase
  }
} else {
  console.log('Firebase Admin already initialized');
}

const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();

// Add security settings to Firestore
if (db) {
  // Set Firestore settings
  db.settings({
    ignoreUndefinedProperties: true,
    timestampsInSnapshots: true
  });
}

// Helper function to verify if Firebase is properly initialized
const isFirebaseInitialized = () => {
  try {
    return admin.apps.length > 0;
  } catch (error) {
    console.error('Firebase initialization check error:', error);
    return false;
  }
};

// Export Firebase instances with error handling
module.exports = { 
  admin, 
  db, 
  bucket, 
  auth,
  isFirebaseInitialized
};
