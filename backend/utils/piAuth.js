const axios = require('axios');
const crypto = require('crypto');
const { admin, db } = require('../firebase');

// Validate Pi authentication token
exports.validatePiAuth = async (piToken) => {
  try {
    if (!piToken) {
      console.error('No Pi token provided');
      return null;
    }
    
    // Verify token format
    if (typeof piToken !== 'string' || piToken.length < 20) {
      console.error('Invalid Pi token format');
      return null;
    }
    
    // Get Pi API key from environment variables
    const piApiKey = process.env.PI_API_KEY;
    
    if (!piApiKey) {
      console.error('Pi API key not configured');
      return null;
    }
    
    // Verify token with Pi Network
    const response = await axios.post(
      'https://api.minepi.com/v2/me',
      {},
      {
        headers: {
          'Authorization': `Bearer ${piToken}`,
          'X-Pi-API-Key': piApiKey
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    if (!response.data || !response.data.uid || !response.data.username) {
      console.error('Invalid response from Pi Network API');
      return null;
    }
    
    // Log successful validation
    console.log(`Pi user validated: ${response.data.username}`);
    
    // Return user data
    return {
      uid: response.data.uid,
      username: response.data.username
    };
  } catch (error) {
    console.error('Pi authentication validation error:', error.response?.data || error.message);
    return null;
  }
};

// Verify Pi payment
exports.verifyPiPayment = async (paymentId) => {
  try {
    if (!paymentId) {
      console.error('No payment ID provided');
      return { verified: false, error: 'No payment ID provided' };
    }
    
    // Get Pi API key from environment variables
    const piApiKey = process.env.PI_API_KEY;
    
    if (!piApiKey) {
      console.error('Pi API key not configured');
      return { verified: false, error: 'Pi API key not configured' };
    }
    
    // Verify payment with Pi Network
    const response = await axios.get(
      `https://api.minepi.com/v2/payments/${paymentId}`,
      {
        headers: {
          'X-Pi-API-Key': piApiKey
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    if (!response.data || !response.data.identifier) {
      console.error('Invalid response from Pi Network API');
      return { verified: false, error: 'Invalid response from Pi Network' };
    }
    
    const payment = response.data;
    
    // Check if payment is verified
    if (!payment.transaction || !payment.transaction.verified) {
      return { 
        verified: false, 
        error: 'Payment not verified by Pi Network',
        status: payment.status
      };
    }
    
    // Check if payment is completed
    if (!payment.status.developer_completed) {
      return { 
        verified: false, 
        error: 'Payment not completed by developer',
        status: payment.status
      };
    }
    
    // Store verified payment in database
    await db.collection('piPayments').doc(paymentId).set({
      paymentId: payment.identifier,
      userId: payment.user.uid,
      username: payment.user.username,
      amount: payment.amount,
      memo: payment.memo,
      metadata: payment.metadata || {},
      txid: payment.transaction.txid,
      verified: true,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date(payment.created_at)
    });
    
    // Log successful verification
    console.log(`Pi payment verified: ${paymentId} for ${payment.amount} Pi`);
    
    return { 
      verified: true, 
      payment: {
        id: payment.identifier,
        amount: payment.amount,
        memo: payment.memo,
        txid: payment.transaction.txid
      }
    };
  } catch (error) {
    console.error('Pi payment verification error:', error.response?.data || error.message);
    return { 
      verified: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

// Complete Pi payment
exports.completePiPayment = async (paymentId) => {
  try {
    if (!paymentId) {
      console.error('No payment ID provided');
      return { completed: false, error: 'No payment ID provided' };
    }
    
    // Get Pi API key from environment variables
    const piApiKey = process.env.PI_API_KEY;
    
    if (!piApiKey) {
      console.error('Pi API key not configured');
      return { completed: false, error: 'Pi API key not configured' };
    }
    
    // Complete payment with Pi Network
    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {},
      {
        headers: {
          'X-Pi-API-Key': piApiKey
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    if (!response.data || !response.data.identifier) {
      console.error('Invalid response from Pi Network API');
      return { completed: false, error: 'Invalid response from Pi Network' };
    }
    
    // Update payment status in database
    await db.collection('piPayments').doc(paymentId).update({
      status: {
        developer_completed: true,
        developer_completed_timestamp: admin.firestore.FieldValue.serverTimestamp()
      }
    });
    
    // Log successful completion
    console.log(`Pi payment completed: ${paymentId}`);
    
    return { 
      completed: true, 
      payment: response.data
    };
  } catch (error) {
    console.error('Pi payment completion error:', error.response?.data || error.message);
    return { 
      completed: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

// Generate secure payment ID
exports.generatePaymentId = () => {
  return `pi_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
};
