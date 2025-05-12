import { Platform } from 'react-native';

// Define the Pi Browser URL as a constant
export const PI_BROWSER_URL = 'https://app.minepi.com';

// Mock implementation for non-web platforms
const mockPiSDK = {
  authenticate: async () => ({ accessToken: 'mock-token', user: { uid: 'mock-uid', username: 'mock-user' } }),
  createPayment: async () => ({ identifier: 'mock-payment-id', memo: 'Mock payment', amount: 1, uid: 'mock-uid' }),
  openPayment: async () => ({ status: 'COMPLETED', txid: 'mock-txid' }),
  cancelPayment: async () => true,
  openConsentDialog: async () => true,
  openShareDialog: async () => true,
};

// Mock implementation for Pi Ads
export const showPiAd = async (adType: string) => {
  if (Platform.OS !== 'web') {
    console.log(`Mock showing ${adType} ad for non-web platform`);
    return { result: 'AD_SHOWN', adId: `mock-ad-${Date.now()}` };
  }
  
  try {
    if (!isPiSDKInitialized()) {
      throw new Error('Pi SDK not initialized');
    }
    
    // In a real implementation, this would call the Pi SDK's ad API
    console.log(`Showing ${adType} ad`);
    return { result: 'AD_SHOWN', adId: `mock-ad-${Date.now()}` };
  } catch (error) {
    console.error(`Error showing ${adType} ad:`, error);
    throw error;
  }
};

export const isPiAdReady = async (adType: string) => {
  if (Platform.OS !== 'web') {
    return true; // Always return true for non-web platforms
  }
  
  try {
    if (!isPiSDKInitialized()) {
      return false;
    }
    
    // In a real implementation, this would check if an ad is ready
    return true;
  } catch (error) {
    console.error(`Error checking if ${adType} ad is ready:`, error);
    return false;
  }
};

export const requestPiAd = async (adType: string) => {
  if (Platform.OS !== 'web') {
    console.log(`Mock requesting ${adType} ad for non-web platform`);
    return { result: 'AD_LOADED' };
  }
  
  try {
    if (!isPiSDKInitialized()) {
      throw new Error('Pi SDK not initialized');
    }
    
    // In a real implementation, this would request an ad from the Pi SDK
    console.log(`Requesting ${adType} ad`);
    return { result: 'AD_LOADED' };
  } catch (error) {
    console.error(`Error requesting ${adType} ad:`, error);
    throw error;
  }
};

// Variable to track if Pi SDK is initialized
let piSDKInitialized = false;

/**
 * Check if the app is running in Pi Browser
 * @returns {boolean} True if running in Pi Browser
 */
export const isRunningInPiBrowser = (): boolean => {
  if (Platform.OS !== 'web') return false;
  
  try {
    // Check if window.Pi exists or if the user agent contains Pi Browser
    const userAgent = navigator.userAgent.toLowerCase();
    return typeof window !== 'undefined' && (typeof window.Pi !== 'undefined' || userAgent.includes('pi browser'));
  } catch (error) {
    console.error('Error checking if running in Pi Browser:', error);
    return false;
  }
};

/**
 * Check if Pi SDK is initialized
 * @returns {boolean} True if Pi SDK is initialized
 */
export const isPiSDKInitialized = (): boolean => {
  if (Platform.OS !== 'web') return true; // Always return true for non-web platforms
  
  try {
    return piSDKInitialized && typeof window !== 'undefined' && typeof window.Pi !== 'undefined';
  } catch (error) {
    console.error('Error checking if Pi SDK is initialized:', error);
    return false;
  }
};

/**
 * Initialize Pi SDK
 * @returns {Promise<boolean>} True if initialization was successful
 */
export const initPiSDK = async (): Promise<boolean> => {
  if (Platform.OS !== 'web') {
    console.log('Pi SDK initialization skipped (non-web platform)');
    return true;
  }
  
  try {
    // Check if Pi SDK is already initialized
    if (isPiSDKInitialized()) {
      console.log('Pi SDK already initialized');
      return true;
    }
    
    // Check if Pi object exists in window
    if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
      console.log('Pi SDK not found in window object');
      return false;
    }
    
    // Initialize Pi SDK
    // IMPORTANT: Using environment variable for sandbox mode
    await window.Pi?.init({ 
      version: "2.0", 
      sandbox: process.env.NODE_ENV !== 'production' 
    });
    
    console.log('Pi SDK initialized successfully');
    piSDKInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing Pi SDK:', error);
    return false;
  }
};

/**
 * Force reload Pi SDK
 * @returns {Promise<boolean>} True if reload was successful
 */
export const forceReloadPiSDK = async (): Promise<boolean> => {
  if (Platform.OS !== 'web') {
    console.log('Pi SDK reload skipped (non-web platform)');
    return true;
  }
  
  try {
    // Reset initialization flag
    piSDKInitialized = false;
    
    // Try to initialize again
    return await initPiSDK();
  } catch (error) {
    console.error('Error reloading Pi SDK:', error);
    return false;
  }
};

/**
 * Load Pi SDK directly by injecting the script
 */
export const loadPiSDKDirectly = (): void => {
  if (Platform.OS !== 'web') {
    console.log('Direct Pi SDK loading skipped (non-web platform)');
    return;
  }
  
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.log('Window or document not available');
      return;
    }
    
    // Check if script already exists
    const existingScript = document.getElementById('pi-sdk-script');
    if (existingScript) {
      console.log('Pi SDK script already exists, removing it');
      existingScript.remove();
    }
    
    // Create and inject the script
    const script = document.createElement('script');
    script.id = 'pi-sdk-script';
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => {
      console.log('Pi SDK script loaded directly');
      initPiSDK().then(success => {
        console.log('Pi SDK initialization after direct load:', success ? 'successful' : 'failed');
      });
    };
    script.onerror = (error) => {
      console.error('Error loading Pi SDK script directly:', error);
    };
    
    document.head.appendChild(script);
  } catch (error) {
    console.error('Error directly loading Pi SDK:', error);
  }
};

/**
 * Open Pi Browser
 */
export const openPiBrowser = (): void => {
  if (Platform.OS === 'web') {
    // Redirect to Pi Browser directly
    if (typeof window !== 'undefined') {
      window.location.href = PI_BROWSER_URL;
    }
  } else {
    // On mobile, try to open the URL
    const Linking = require('react-native').Linking;
    Linking.canOpenURL(PI_BROWSER_URL).then((supported: boolean) => {
      if (supported) {
        Linking.openURL(PI_BROWSER_URL);
      } else {
        console.log("Don't know how to open URI: " + PI_BROWSER_URL);
      }
    });
  }
};

/**
 * Authenticate with Pi Network
 * @returns {Promise<any>} Authentication result
 */
export const authenticateWithPi = async () => {
  if (Platform.OS !== 'web') {
    console.log('Using mock Pi authentication for non-web platform');
    return mockPiSDK.authenticate();
  }
  
  try {
    // Ensure Pi SDK is initialized
    if (!isPiSDKInitialized()) {
      const initialized = await initPiSDK();
      if (!initialized) {
        throw new Error('Pi SDK not initialized');
      }
    }
    
    // Authenticate with Pi
    if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
      throw new Error('Pi SDK not available');
    }
    
    const authResult = await window.Pi?.authenticate(['username', 'payments'], onIncompletePaymentFound);
    console.log('Pi authentication result:', authResult);
    return authResult;
  } catch (error) {
    console.error('Error authenticating with Pi:', error);
    throw error;
  }
};

/**
 * Create a payment with Pi
 * @param {number} amount Amount to pay
 * @param {string} memo Payment memo
 * @returns {Promise<any>} Payment result
 */
export const createPiPayment = async (amount: number, memo: string) => {
  if (Platform.OS !== 'web') {
    console.log('Using mock Pi payment for non-web platform');
    return mockPiSDK.createPayment();
  }
  
  try {
    // Ensure Pi SDK is initialized
    if (!isPiSDKInitialized()) {
      const initialized = await initPiSDK();
      if (!initialized) {
        throw new Error('Pi SDK not initialized');
      }
    }
    
    if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
      throw new Error('Pi SDK not available');
    }
    
    // Create payment
    const payment = await window.Pi?.createPayment({
      amount: amount.toString(),
      memo,
      metadata: { timestamp: Date.now() },
    });
    
    console.log('Pi payment created:', payment);
    return payment;
  } catch (error) {
    console.error('Error creating Pi payment:', error);
    throw error;
  }
};

/**
 * Open a payment with Pi
 * @param {string} paymentId Payment ID
 * @returns {Promise<any>} Payment result
 */
export const openPiPayment = async (paymentId: string) => {
  if (Platform.OS !== 'web') {
    console.log('Using mock Pi open payment for non-web platform');
    return mockPiSDK.openPayment();
  }
  
  try {
    // Ensure Pi SDK is initialized
    if (!isPiSDKInitialized()) {
      const initialized = await initPiSDK();
      if (!initialized) {
        throw new Error('Pi SDK not initialized');
      }
    }
    
    if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
      throw new Error('Pi SDK not available');
    }
    
    // Open payment
    const result = await window.Pi?.openPayment(paymentId);
    console.log('Pi payment opened:', result);
    return result;
  } catch (error) {
    console.error('Error opening Pi payment:', error);
    throw error;
  }
};

/**
 * Cancel a payment with Pi
 * @param {string} paymentId Payment ID
 * @returns {Promise<boolean>} True if cancellation was successful
 */
export const cancelPiPayment = async (paymentId: string) => {
  if (Platform.OS !== 'web') {
    console.log('Using mock Pi cancel payment for non-web platform');
    return mockPiSDK.cancelPayment();
  }
  
  try {
    // Ensure Pi SDK is initialized
    if (!isPiSDKInitialized()) {
      const initialized = await initPiSDK();
      if (!initialized) {
        throw new Error('Pi SDK not initialized');
      }
    }
    
    if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
      throw new Error('Pi SDK not available');
    }
    
    // Cancel payment
    const result = await window.Pi?.cancelPayment(paymentId);
    console.log('Pi payment cancelled:', result);
    return result;
  } catch (error) {
    console.error('Error cancelling Pi payment:', error);
    throw error;
  }
};

/**
 * Handle incomplete payment
 * @param {any} payment Incomplete payment
 */
const onIncompletePaymentFound = (payment: any) => {
  console.log('Incomplete payment found:', payment);
  // Handle incomplete payment
  // This could involve completing the payment or cancelling it
};

/**
 * Open consent dialog with Pi
 * @param {string} purpose Purpose of consent
 * @returns {Promise<boolean>} True if consent was granted
 */
export const openPiConsentDialog = async (purpose: string) => {
  if (Platform.OS !== 'web') {
    console.log('Using mock Pi consent dialog for non-web platform');
    return mockPiSDK.openConsentDialog();
  }
  
  try {
    // Ensure Pi SDK is initialized
    if (!isPiSDKInitialized()) {
      const initialized = await initPiSDK();
      if (!initialized) {
        throw new Error('Pi SDK not initialized');
      }
    }
    
    if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
      throw new Error('Pi SDK not available');
    }
    
    // Open consent dialog
    const result = await window.Pi?.openConsentDialog(purpose);
    console.log('Pi consent dialog result:', result);
    return result;
  } catch (error) {
    console.error('Error opening Pi consent dialog:', error);
    throw error;
  }
};

/**
 * Open share dialog with Pi
 * @param {string} title Title of share
 * @param {string} message Message to share
 * @returns {Promise<boolean>} True if share was successful
 */
export const openPiShareDialog = async (title: string, message: string) => {
  if (Platform.OS !== 'web') {
    console.log('Using mock Pi share dialog for non-web platform');
    return mockPiSDK.openShareDialog();
  }
  
  try {
    // Ensure Pi SDK is initialized
    if (!isPiSDKInitialized()) {
      const initialized = await initPiSDK();
      if (!initialized) {
        throw new Error('Pi SDK not initialized');
      }
    }
    
    if (typeof window === 'undefined' || typeof window.Pi === 'undefined') {
      throw new Error('Pi SDK not available');
    }
    
    // Open share dialog
    const result = await window.Pi?.openShareDialog(title, message);
    console.log('Pi share dialog result:', result);
    return result;
  } catch (error) {
    console.error('Error opening Pi share dialog:', error);
    throw error;
  }
};

// Type definition for Pi SDK
declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox: boolean }) => Promise<void>;
      authenticate: (scopes: string[], onIncompletePaymentFound: (payment: any) => void) => Promise<any>;
      createPayment: (paymentData: { amount: string; memo: string; metadata: any }) => Promise<any>;
      openPayment: (paymentId: string) => Promise<any>;
      cancelPayment: (paymentId: string) => Promise<boolean>;
      openConsentDialog: (purpose: string) => Promise<boolean>;
      openShareDialog: (title: string, message: string) => Promise<boolean>;
    };
  }
}
