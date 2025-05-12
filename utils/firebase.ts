import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  connectAuthEmulator,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDfQM7Xp8LRDsHnFTeKO8r3WKfmB-0-lDI',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'trendforge-blog.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'trendforge-blog',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'trendforge-blog.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-ABCDEF1234',
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error('Firebase initialization failed');
  }
} else {
  app = getApp();
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to emulators in development
if (__DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  try {
    if (Platform.OS === 'web') {
      // Only connect to emulators on web in development
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('Connected to Firebase emulators');
    }
  } catch (error) {
    console.error('Error connecting to Firebase emulators:', error);
  }
}

// Enhanced authentication functions with better error handling
export const signIn = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate password length
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // Provide more user-friendly error messages
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format');
    } else {
      throw error;
    }
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
    
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    // Provide more user-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email is already in use');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak');
    } else {
      throw error;
    }
  }
};

export const signOut = async () => {
  try {
    return await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Password reset
export const resetPassword = async (email: string) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    return await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('No user found with this email');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format');
    } else {
      throw error;
    }
  }
};

// Update user email
export const updateUserEmail = async (user: User, newEmail: string) => {
  try {
    if (!user) {
      throw new Error('User is not authenticated');
    }
    
    if (!newEmail) {
      throw new Error('New email is required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error('Invalid email format');
    }
    
    return await updateEmail(user, newEmail);
  } catch (error) {
    console.error('Update email error:', error);
    throw error;
  }
};

// Update user password
export const updateUserPassword = async (user: User, currentPassword: string, newPassword: string) => {
  try {
    if (!user) {
      throw new Error('User is not authenticated');
    }
    
    if (!user.email) {
      throw new Error('User email is not available');
    }
    
    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new Error('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
    
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    return await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error('Update password error:', error);
    
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak');
    } else {
      throw error;
    }
  }
};

// Auth state listener with error handling
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  try {
    return onAuthStateChanged(auth, callback, (error) => {
      console.error('Auth state change error:', error);
    });
  } catch (error) {
    console.error('Auth state listener setup error:', error);
    throw error;
  }
};

// Export Firebase instances
export { auth, db, storage };

// Export default Firebase app
export default app;
