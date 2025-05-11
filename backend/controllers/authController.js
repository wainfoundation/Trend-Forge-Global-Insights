const { db, admin, isFirebaseInitialized } = require('../firebase');
const { validatePiAuth } = require('../utils/piAuth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate secure JWT token
const generateToken = (userId, role) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
    const expiresIn = parseInt(process.env.JWT_EXPIRY) || 86400; // 24 hours in seconds
    
    return jwt.sign(
      { 
        uid: userId, 
        role,
        iat: Math.floor(Date.now() / 1000),
      }, 
      jwtSecret, 
      { expiresIn }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
};

// Hash password securely
const hashPassword = async (password) => {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to secure password');
  }
};

// Compare password with hash
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password comparison error:', error);
    throw new Error('Failed to verify password');
  }
};

// Login controller with enhanced security
exports.login = async (req, res) => {
  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      return res.status(500).json({ error: true, message: "Authentication service unavailable" });
    }
    
    const { email, password, piToken } = req.body;
    
    // If Pi token is provided, validate with Pi Network
    if (piToken) {
      try {
        const piUser = await validatePiAuth(piToken);
        if (!piUser) {
          return res.status(401).json({ error: true, message: "Invalid Pi authentication" });
        }
        
        // Check if Pi user exists in our database
        const piUserSnapshot = await db.collection('users')
          .where('piUsername', '==', piUser.username)
          .limit(1)
          .get();
        
        if (piUserSnapshot.empty) {
          // Create new user if not exists with secure defaults
          const newUser = {
            piUsername: piUser.username,
            piUid: piUser.uid,
            role: 'public',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionPlan: 'free',
            subscriptionStatus: 'active',
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            loginAttempts: 0,
            disabled: false,
            securitySettings: {
              twoFactorEnabled: false,
              lastPasswordChange: null
            }
          };
          
          const userRef = await db.collection('users').add(newUser);
          const token = await admin.auth().createCustomToken(userRef.id);
          
          // Log successful login
          console.log(`New Pi user created and logged in: ${piUser.username}`);
          
          return res.status(200).json({
            token,
            user: {
              id: userRef.id,
              ...newUser,
              securitySettings: undefined // Don't expose security settings to client
            }
          });
        } else {
          // Return existing user
          const userDoc = piUserSnapshot.docs[0];
          const userData = userDoc.data();
          
          // Check if user is disabled
          if (userData.disabled) {
            return res.status(403).json({ error: true, message: "Account disabled" });
          }
          
          // Update login timestamp and reset login attempts
          await userDoc.ref.update({
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            loginAttempts: 0
          });
          
          const token = await admin.auth().createCustomToken(userDoc.id);
          
          // Log successful login
          console.log(`Pi user logged in: ${piUser.username}`);
          
          return res.status(200).json({
            token,
            user: {
              id: userDoc.id,
              ...userData,
              securitySettings: undefined // Don't expose security settings to client
            }
          });
        }
      } catch (error) {
        console.error('Pi authentication error:', error);
        return res.status(500).json({ error: true, message: "Pi authentication failed" });
      }
    }
    
    // Email/password login (for admin and journalists)
    if (!email || !password) {
      return res.status(400).json({ error: true, message: "Email and password are required" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: true, message: "Invalid email format" });
    }
    
    // Check for admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || "adminmrwain@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin@1";
    
    if (email === adminEmail && password === adminPassword) {
      // Create admin user if it doesn't exist
      const adminSnapshot = await db.collection('users')
        .where('email', '==', adminEmail)
        .limit(1)
        .get();
      
      let adminId;
      
      if (adminSnapshot.empty) {
        // Create admin user with secure defaults
        const adminUser = {
          email: adminEmail,
          name: "Admin",
          role: 'admin',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          loginAttempts: 0,
          disabled: false,
          securitySettings: {
            twoFactorEnabled: false,
            lastPasswordChange: admin.firestore.FieldValue.serverTimestamp()
          }
        };
        
        const adminRef = await db.collection('users').add(adminUser);
        adminId = adminRef.id;
      } else {
        adminId = adminSnapshot.docs[0].id;
        
        // Update login timestamp and reset login attempts
        await adminSnapshot.docs[0].ref.update({
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          loginAttempts: 0
        });
      }
      
      const token = await admin.auth().createCustomToken(adminId);
      
      // Log admin login
      console.log(`Admin logged in: ${adminEmail}`);
      
      return res.status(200).json({
        token,
        user: {
          id: adminId,
          email: adminEmail,
          role: 'admin',
          name: "Admin"
        }
      });
    }
    
    // Check if user exists
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      // Don't reveal if user exists or not
      return res.status(401).json({ error: true, message: "Invalid credentials" });
    }
    
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Check if user is disabled
    if (userData.disabled) {
      return res.status(403).json({ error: true, message: "Account disabled" });
    }
    
    // Check for too many login attempts
    if (userData.loginAttempts >= 5) {
      // Check if enough time has passed since last attempt
      const lastLoginAttempt = userData.lastLoginAttempt?.toDate() || new Date(0);
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes
      const now = new Date();
      
      if (now - lastLoginAttempt < lockoutDuration) {
        return res.status(429).json({ 
          error: true, 
          message: "Too many failed login attempts. Please try again later" 
        });
      }
      
      // Reset login attempts if lockout period has passed
      await userDoc.ref.update({
        loginAttempts: 0
      });
    }
    
    // Verify password
    let passwordValid = false;
    
    if (userData.passwordHash) {
      // Use bcrypt for password verification
      passwordValid = await comparePassword(password, userData.passwordHash);
    } else if (userData.password) {
      // Legacy password check (in production, all passwords should be hashed)
      passwordValid = userData.password === password;
      
      // Upgrade to hashed password if match
      if (passwordValid) {
        const passwordHash = await hashPassword(password);
        await userDoc.ref.update({
          passwordHash,
          password: admin.firestore.FieldValue.delete() // Remove plaintext password
        });
      }
    }
    
    if (!passwordValid) {
      // Increment login attempts
      await userDoc.ref.update({
        loginAttempts: admin.firestore.FieldValue.increment(1),
        lastLoginAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return res.status(401).json({ error: true, message: "Invalid credentials" });
    }
    
    // Reset login attempts and update last login
    await userDoc.ref.update({
      loginAttempts: 0,
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create custom token
    const token = await admin.auth().createCustomToken(userDoc.id);
    
    // Remove sensitive data
    const safeUserData = { ...userData };
    delete safeUserData.password;
    delete safeUserData.passwordHash;
    delete safeUserData.loginAttempts;
    delete safeUserData.lastLoginAttempt;
    delete safeUserData.securitySettings;
    
    // Log successful login
    console.log(`User logged in: ${email}`);
    
    res.status(200).json({
      token,
      user: {
        id: userDoc.id,
        ...safeUserData
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: true, message: "Authentication failed" });
  }
};

// Register controller with enhanced security
exports.register = async (req, res) => {
  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      return res.status(500).json({ error: true, message: "Authentication service unavailable" });
    }
    
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: true, message: "Email, password and name are required" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: true, message: "Invalid email format" });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: true, message: "Password must be at least 8 characters" });
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: true, 
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
      });
    }
    
    // Check if user already exists
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (!userSnapshot.empty) {
      return res.status(400).json({ error: true, message: "User already exists" });
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create new user with secure defaults
    const newUser = {
      email,
      passwordHash, // Store hashed password
      name,
      role: 'public',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      loginAttempts: 0,
      disabled: false,
      securitySettings: {
        twoFactorEnabled: false,
        lastPasswordChange: admin.firestore.FieldValue.serverTimestamp()
      }
    };
    
    const userRef = await db.collection('users').add(newUser);
    
    // Create custom token
    const token = await admin.auth().createCustomToken(userRef.id);
    
    // Remove sensitive data
    const safeUserData = { ...newUser };
    delete safeUserData.passwordHash;
    delete safeUserData.loginAttempts;
    delete safeUserData.securitySettings;
    
    // Log successful registration
    console.log(`New user registered: ${email}`);
    
    res.status(201).json({
      token,
      user: {
        id: userRef.id,
        ...safeUserData
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: true, message: "Registration failed" });
  }
};

// Verify token controller with enhanced security
exports.verifyToken = async (req, res) => {
  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      return res.status(500).json({ error: true, message: "Authentication service unavailable" });
    }
    
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: true, message: "Token is required" });
    }
    
    try {
      // Verify token with short expiration
      const decodedToken = await admin.auth().verifyIdToken(token, true);
      
      // Check token expiration
      const tokenExp = decodedToken.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (tokenExp < now) {
        return res.status(401).json({ error: true, message: "Token expired" });
      }
      
      const userId = decodedToken.uid;
      
      // Get user data
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: true, message: "User not found" });
      }
      
      const userData = userDoc.data();
      
      // Check if user is disabled
      if (userData.disabled) {
        return res.status(403).json({ error: true, message: "Account disabled" });
      }
      
      // Remove sensitive data
      const safeUserData = { ...userData };
      delete safeUserData.password;
      delete safeUserData.passwordHash;
      delete safeUserData.loginAttempts;
      delete safeUserData.lastLoginAttempt;
      delete safeUserData.securitySettings;
      
      res.status(200).json({
        user: {
          id: userDoc.id,
          ...safeUserData
        }
      });
    } catch (error) {
      console.error('Token verification specific error:', error);
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: true, message: "Token expired" });
      } else if (error.code === 'auth/id-token-revoked') {
        return res.status(401).json({ error: true, message: "Token revoked" });
      } else if (error.code === 'auth/invalid-id-token') {
        return res.status(401).json({ error: true, message: "Invalid token" });
      } else {
        return res.status(401).json({ error: true, message: "Token verification failed" });
      }
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: true, message: "Authentication service error" });
  }
};

// Password reset request
exports.requestPasswordReset = async (req, res) => {
  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      return res.status(500).json({ error: true, message: "Authentication service unavailable" });
    }
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: true, message: "Email is required" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: true, message: "Invalid email format" });
    }
    
    // Check if user exists
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      // Don't reveal if user exists or not
      return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
    }
    
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Check if user is disabled
    if (userData.disabled) {
      // Don't reveal if user is disabled
      return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token expiration (1 hour)
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
    
    // Save reset token to user document
    await userDoc.ref.update({
      resetTokenHash,
      resetTokenExpires: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // In a real application, send email with reset link
    // For this example, we'll just return success
    console.log(`Password reset requested for: ${email}`);
    
    res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: true, message: "Password reset request failed" });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      return res.status(500).json({ error: true, message: "Authentication service unavailable" });
    }
    
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: true, message: "Token and new password are required" });
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: true, message: "Password must be at least 8 characters" });
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        error: true, 
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
      });
    }
    
    // Hash the token for comparison
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with this token
    const userSnapshot = await db.collection('users')
      .where('resetTokenHash', '==', resetTokenHash)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      return res.status(400).json({ error: true, message: "Invalid or expired token" });
    }
    
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Check if token is expired
    const tokenExpires = userData.resetTokenExpires?.toDate() || new Date(0);
    const now = new Date();
    
    if (now > tokenExpires) {
      return res.status(400).json({ error: true, message: "Token expired" });
    }
    
    // Hash new password
    const passwordHash = await hashPassword(newPassword);
    
    // Update user with new password and remove reset token
    await userDoc.ref.update({
      passwordHash,
      resetTokenHash: admin.firestore.FieldValue.delete(),
      resetTokenExpires: admin.firestore.FieldValue.delete(),
      'securitySettings.lastPasswordChange': admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Password reset completed for user: ${userDoc.id}`);
    
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: true, message: "Password reset failed" });
  }
};
