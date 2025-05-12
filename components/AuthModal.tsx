import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signIn, signUp } from '@/utils/firebase';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Eye, EyeOff, X, RefreshCw, ExternalLink } from 'lucide-react-native';
import { 
  authenticateWithPi, 
  initPiSDK, 
  isPiSDKInitialized, 
  forceReloadPiSDK, 
  loadPiSDKDirectly,
  isRunningInPiBrowser,
  PI_BROWSER_URL,
  openPiBrowser
} from '@/utils/pi-sdk';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ 
  visible, 
  onClose,
  initialMode = 'login'
}: AuthModalProps) {
  const router = useRouter();
  const { setUser } = useAuthStore();
  
  // Form state
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [piSdkReady, setPiSdkReady] = useState(false);
  const [piSdkLoading, setPiSdkLoading] = useState(false);
  const [showDirectLoadButton, setShowDirectLoadButton] = useState(false);
  const [isInPiBrowser, setIsInPiBrowser] = useState(false);
  
  // Check Pi SDK availability when modal opens
  useEffect(() => {
    if (visible && Platform.OS === 'web') {
      // Check if running in Pi Browser
      const inPiBrowser = isRunningInPiBrowser();
      setIsInPiBrowser(inPiBrowser);
      console.log('Auth Modal - Running in Pi Browser:', inPiBrowser);
      
      checkPiSdkAvailability();
    }
  }, [visible]);
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setMode(initialMode);
      setError(null);
    } else {
      // Clear form after a delay to avoid visual glitches
      const timeout = setTimeout(() => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setError(null);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [visible, initialMode]);
  
  const checkPiSdkAvailability = async () => {
    if (Platform.OS !== 'web') {
      setPiSdkReady(false);
      return;
    }
    
    try {
      // Check if Pi SDK is already initialized
      if (isPiSDKInitialized()) {
        console.log('Pi SDK is already initialized and available');
        setPiSdkReady(true);
        setShowDirectLoadButton(false);
        return;
      }
      
      setPiSdkLoading(true);
      setShowDirectLoadButton(false);
      
      // Try to initialize Pi SDK if it's not already initialized
      const result = await initPiSDK();
      
      setPiSdkReady(result);
      
      if (!result) {
        console.log('Pi SDK initialization failed in AuthModal');
        
        // If not in Pi Browser, show a more specific error message
        if (!isInPiBrowser) {
          setError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
        }
        
        setShowDirectLoadButton(true);
      }
    } catch (error) {
      console.error('Error checking Pi SDK availability:', error);
      setPiSdkReady(false);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
      } else {
        setError('Error initializing Pi SDK. Please try again later.');
      }
      
      setShowDirectLoadButton(true);
    } finally {
      setPiSdkLoading(false);
    }
  };
  
  const handleRetryPiSDK = async () => {
    try {
      setPiSdkLoading(true);
      setError(null);
      setShowDirectLoadButton(false);
      
      // Force reload the Pi SDK
      const result = await forceReloadPiSDK();
      
      setPiSdkReady(result);
      
      if (!result) {
        // If not in Pi Browser, show a more specific error message
        if (!isInPiBrowser) {
          setError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
        } else {
          setError('Failed to initialize Pi SDK. Please try direct loading or refreshing the page.');
        }
        
        setShowDirectLoadButton(true);
      }
    } catch (error) {
      console.error('Error retrying Pi SDK initialization:', error);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
      } else {
        setError('Error initializing Pi SDK. Please try again later.');
      }
      
      setPiSdkReady(false);
      setShowDirectLoadButton(true);
    } finally {
      setPiSdkLoading(false);
    }
  };
  
  const handleDirectLoad = () => {
    setPiSdkLoading(true);
    setError('Trying direct load of Pi SDK...');
    setShowDirectLoadButton(false);
    
    try {
      // Load Pi SDK directly
      loadPiSDKDirectly();
      
      // Check if it worked after a short delay
      setTimeout(() => {
        if (isPiSDKInitialized()) {
          console.log('Pi SDK loaded directly successfully');
          setPiSdkReady(true);
          setError(null);
        } else {
          console.log('Direct load of Pi SDK failed');
          
          // If not in Pi Browser, show a more specific error message
          if (!isInPiBrowser) {
            setError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
          } else {
            setError('Direct load of Pi SDK failed. Please try visiting the Pi Browser directly.');
          }
          
          setShowDirectLoadButton(false);
        }
        setPiSdkLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to direct load Pi SDK:', error);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
      } else {
        setError(`Pi SDK direct load error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setShowDirectLoadButton(false);
      setPiSdkLoading(false);
    }
  };
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };
  
  const handleLogin = async () => {
    try {
      setError(null);
      
      // Validate inputs
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
      
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      setLoading(true);
      
      // Sign in with Firebase
      const userCredential = await signIn(email, password);
      const user = userCredential.user;
      
      // Determine user role based on email (simplified)
      let role: 'user' | 'journalist' | 'admin' = 'user';
      
      if (email.includes('admin')) {
        role = 'admin';
      } else if (email.includes('journalist')) {
        role = 'journalist';
      }
      
      // Update auth store
      setUser(user.email || user.uid, user.uid, role);
      
      // Close modal
      onClose();
      
      // Redirect based on role
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'journalist') {
        router.push('/journalist-dashboard');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection');
      } else {
        setError(error.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async () => {
    try {
      setError(null);
      
      // Validate inputs
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      if (!validatePassword(password)) {
        setError('Password must be at least 6 characters long');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      setLoading(true);
      
      // Create user with Firebase
      const userCredential = await signUp(email, password);
      const user = userCredential.user;
      
      // Update auth store with 'user' role
      setUser(user.email || user.uid, user.uid, 'user');
      
      // Show success message
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully!',
        [{ text: 'OK', onPress: onClose }]
      );
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection');
      } else {
        setError(error.message || 'An error occurred during registration');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handlePiNetworkAuth = async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (Platform.OS !== 'web') {
        setError('Pi Network authentication is only available on web');
        return;
      }
      
      // Check if Pi SDK is available
      if (!piSdkReady) {
        // If not in Pi Browser, show a more specific error message
        if (!isInPiBrowser) {
          setError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
        } else {
          setError('Pi Network SDK is not available. Please try again later.');
        }
        return;
      }
      
      // Authenticate with Pi Network
      const authResult = await authenticateWithPi().catch(error => {
        console.error('Pi authentication error:', error);
        throw new Error('Pi Network authentication failed. Please try again.');
      });
      
      // Extract user info
      const { user } = authResult;
      
      // Determine user role based on username (simplified)
      let role: 'user' | 'journalist' | 'admin' = 'user';
      
      if (user.username.includes('admin')) {
        role = 'admin';
      } else if (user.username.includes('journalist')) {
        role = 'journalist';
      }
      
      // Update auth store
      setUser(user.username, user.uid, role);
      
      // Close modal
      onClose();
      
      // Redirect based on role
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'journalist') {
        router.push('/journalist-dashboard');
      }
      
    } catch (error: any) {
      console.error('Pi Network authentication error:', error);
      setError('Pi Network authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!loading}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textLight} />
                  ) : (
                    <Eye size={20} color={colors.textLight} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            {mode === 'register' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.textLight}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.textLight} />
                    ) : (
                      <Eye size={20} color={colors.textLight} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {mode === 'login' && (
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.switchModeContainer}>
              <Text style={styles.switchModeText}>
                {mode === 'login' 
                  ? "Don't have an account?" 
                  : "Already have an account?"}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.switchModeButton}>
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>
            
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>
            
            {Platform.OS === 'web' && (
              <View>
                <TouchableOpacity 
                  style={[
                    styles.piNetworkButton,
                    (!piSdkReady || loading || piSdkLoading) && styles.piNetworkButtonDisabled
                  ]}
                  onPress={handlePiNetworkAuth}
                  disabled={loading || !piSdkReady || piSdkLoading}
                >
                  {piSdkLoading ? (
                    <ActivityIndicator size="small" color={colors.card} />
                  ) : (
                    <Text style={styles.piNetworkButtonText}>
                      {piSdkReady 
                        ? "Sign in with Pi Network" 
                        : "Pi Network SDK not available"}
                    </Text>
                  )}
                </TouchableOpacity>
                
                {!piSdkReady && !piSdkLoading && (
                  <View style={styles.piSdkButtonsContainer}>
                    <TouchableOpacity 
                      style={styles.retryPiSdkButton}
                      onPress={handleRetryPiSDK}
                      disabled={piSdkLoading}
                    >
                      <RefreshCw size={14} color={colors.primary} />
                      <Text style={styles.retryPiSdkText}>Retry</Text>
                    </TouchableOpacity>
                    
                    {showDirectLoadButton && (
                      <TouchableOpacity 
                        style={styles.directLoadButton}
                        onPress={handleDirectLoad}
                        disabled={piSdkLoading}
                      >
                        <Text style={styles.directLoadText}>Direct Load</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      style={styles.piBrowserButton}
                      onPress={openPiBrowser}
                      disabled={piSdkLoading}
                    >
                      <ExternalLink size={14} color="#7D4698" />
                      <Text style={styles.piBrowserText}>Pi Browser</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink} onPress={() => router.push('/privacy-terms')}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={styles.termsLink} onPress={() => router.push('/privacy-terms')}>
                Privacy Policy
              </Text>
            </Text>
            
            <View style={styles.adContainer}>
              <Text style={styles.adText}>Ads will be provided by Pi Network AdNetwork</Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    ...typography.body,
    color: colors.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    ...typography.body,
    color: colors.text,
  },
  eyeIcon: {
    padding: 12,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.secondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  switchModeText: {
    ...typography.body,
    color: colors.textLight,
  },
  switchModeButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginHorizontal: 8,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  socialButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  socialButtonText: {
    ...typography.body,
    color: colors.text,
  },
  piNetworkButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  piNetworkButtonDisabled: {
    backgroundColor: colors.inactive || '#cccccc',
  },
  piNetworkButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
  piSdkButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  retryPiSdkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  retryPiSdkText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: 4,
  },
  directLoadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  directLoadText: {
    ...typography.bodySmall,
    color: colors.secondary,
  },
  piBrowserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: "#7D4698", // Pi's purple color
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  piBrowserText: {
    ...typography.bodySmall,
    color: "#7D4698", // Pi's purple color
    marginLeft: 4,
  },
  termsText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  termsLink: {
    color: colors.secondary,
  },
  adContainer: {
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  adText: {
    ...typography.caption,
    color: colors.textLight,
  },
});
