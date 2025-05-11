import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/auth-store';
import { 
  initPiSDK, 
  forceReloadPiSDK, 
  isPiSDKInitialized, 
  loadPiSDKDirectly, 
  isRunningInPiBrowser,
  PI_BROWSER_URL
} from '@/utils/pi-sdk';
import { RefreshCw, ExternalLink } from 'lucide-react-native';
import colors from '@/constants/colors';
import CustomSplashScreen from '@/components/SplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

function TRPCProvider(props: { children: React.ReactNode }) {
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: `${process.env.EXPO_PUBLIC_RORK_API_BASE_URL || ''}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default function RootLayout() {
  const { listenToAuthChanges } = useAuthStore();
  const [piSdkInitialized, setPiSdkInitialized] = useState(false);
  const [piSdkError, setPiSdkError] = useState<string | null>(null);
  const [initializingPiSdk, setInitializingPiSdk] = useState(Platform.OS === 'web');
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [showDirectLoadButton, setShowDirectLoadButton] = useState(false);
  const [isInPiBrowser, setIsInPiBrowser] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Initialize auth listener once when the app starts
    listenToAuthChanges();
    
    // Check if running in Pi Browser
    if (Platform.OS === 'web') {
      const inPiBrowser = isRunningInPiBrowser();
      setIsInPiBrowser(inPiBrowser);
      console.log('Running in Pi Browser:', inPiBrowser);
    }
    
    // Initialize Pi SDK with retry mechanism
    const setupPiSDK = async () => {
      if (Platform.OS === 'web') {
        setInitializingPiSdk(true);
        setPiSdkError(null);
        
        try {
          // Check if Pi SDK is already initialized
          if (isPiSDKInitialized()) {
            console.log('Pi SDK already initialized');
            setPiSdkInitialized(true);
            setInitializingPiSdk(false);
            return;
          }
          
          // Try to initialize Pi SDK
          const result = await initPiSDK();
          
          if (result) {
            console.log('Pi SDK initialized successfully in root layout');
            setPiSdkInitialized(true);
            setShowRetryButton(false);
            setShowDirectLoadButton(false);
          } else {
            console.log('Pi SDK initialization returned false');
            
            // If not in Pi Browser, show a more specific error message
            if (!isInPiBrowser) {
              setPiSdkError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
            } else {
              setPiSdkError('Pi SDK initialization failed. You can retry manually or try direct loading.');
            }
            
            setShowRetryButton(true);
            setShowDirectLoadButton(true);
          }
        } catch (error) {
          console.error('Failed to initialize Pi SDK:', error);
          
          // If not in Pi Browser, show a more specific error message
          if (!isInPiBrowser) {
            setPiSdkError(`For the best experience with Pi Network features, please open this app in the Pi Browser.`);
          } else {
            setPiSdkError(`Pi SDK initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          
          setShowRetryButton(true);
          setShowDirectLoadButton(true);
        } finally {
          setInitializingPiSdk(false);
        }
      } else {
        console.log('Pi SDK initialization skipped (non-web platform)');
        // For non-web platforms, we consider it "initialized" (using mock functions)
        setPiSdkInitialized(true);
        setInitializingPiSdk(false);
      }
    };
    
    setupPiSDK();
    
    // Hide splash screen when component mounts
    SplashScreen.hideAsync();
  }, [retryCount]);

  const handleRetryPiSDK = async () => {
    setInitializingPiSdk(true);
    setPiSdkError('Retrying Pi SDK initialization...');
    setShowRetryButton(false);
    setShowDirectLoadButton(false);
    
    try {
      // Force reload the Pi SDK
      const result = await forceReloadPiSDK();
      
      if (result) {
        console.log('Pi SDK reloaded successfully');
        setPiSdkInitialized(true);
        setPiSdkError(null);
      } else {
        console.log('Pi SDK reload failed');
        
        // If not in Pi Browser, show a more specific error message
        if (!isInPiBrowser) {
          setPiSdkError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
        } else {
          setPiSdkError('Pi SDK initialization failed after retry. Please try direct loading or refresh the page.');
        }
        
        setShowRetryButton(true);
        setShowDirectLoadButton(true);
      }
    } catch (error) {
      console.error('Failed to retry Pi SDK initialization:', error);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setPiSdkError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
      } else {
        setPiSdkError(`Pi SDK retry error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setShowRetryButton(true);
      setShowDirectLoadButton(true);
    } finally {
      setInitializingPiSdk(false);
      // Increment retry count to trigger useEffect
      setRetryCount(prev => prev + 1);
    }
  };

  const handleDirectLoad = () => {
    setInitializingPiSdk(true);
    setPiSdkError('Trying direct load of Pi SDK...');
    setShowRetryButton(false);
    setShowDirectLoadButton(false);
    
    try {
      // Load Pi SDK directly
      loadPiSDKDirectly();
      
      // Check if it worked after a short delay
      setTimeout(() => {
        if (isPiSDKInitialized()) {
          console.log('Pi SDK loaded directly successfully');
          setPiSdkInitialized(true);
          setPiSdkError(null);
        } else {
          console.log('Direct load of Pi SDK failed');
          
          // If not in Pi Browser, show a more specific error message
          if (!isInPiBrowser) {
            setPiSdkError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
          } else {
            setPiSdkError('Direct load of Pi SDK failed. Please try visiting the Pi Browser directly.');
          }
          
          setShowRetryButton(true);
          setShowDirectLoadButton(false);
        }
        setInitializingPiSdk(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to direct load Pi SDK:', error);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setPiSdkError('For the best experience with Pi Network features, please open this app in the Pi Browser.');
      } else {
        setPiSdkError(`Pi SDK direct load error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setShowRetryButton(true);
      setShowDirectLoadButton(false);
      setInitializingPiSdk(false);
    }
  };

  const openPiBrowser = () => {
    if (Platform.OS === 'web') {
      // Redirect to Pi Browser directly
      window.location.href = PI_BROWSER_URL;
    } else {
      // On mobile, try to open the URL
      Linking.canOpenURL(PI_BROWSER_URL).then(supported => {
        if (supported) {
          Linking.openURL(PI_BROWSER_URL);
        } else {
          console.log("Don't know how to open URI: " + PI_BROWSER_URL);
        }
      });
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <TRPCProvider>
      {showSplash && <CustomSplashScreen onFinish={handleSplashFinish} />}
      
      {Platform.OS === 'web' && (piSdkError || initializingPiSdk) && (
        <View style={styles.piSdkStatusContainer}>
          {initializingPiSdk ? (
            <Text style={styles.piSdkStatusText}>Initializing Pi SDK...</Text>
          ) : (
            <View style={styles.piSdkErrorContainer}>
              <Text style={styles.piSdkErrorText}>{piSdkError}</Text>
              <View style={styles.buttonContainer}>
                {showRetryButton && (
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={handleRetryPiSDK}
                  >
                    <RefreshCw size={14} color={colors.card} />
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                )}
                
                {showDirectLoadButton && (
                  <TouchableOpacity 
                    style={styles.directLoadButton}
                    onPress={handleDirectLoad}
                  >
                    <Text style={styles.directLoadButtonText}>Direct Load</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.piBrowserButton}
                  onPress={openPiBrowser}
                >
                  <ExternalLink size={14} color={colors.card} />
                  <Text style={styles.piBrowserButtonText}>Open Pi Browser</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
      <RootLayoutNav />
    </TRPCProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  piSdkStatusContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    zIndex: 9999,
  },
  piSdkStatusText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
  piSdkErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  piSdkErrorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  retryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: colors.card,
    fontSize: 12,
    marginLeft: 4,
  },
  directLoadButton: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  directLoadButtonText: {
    color: colors.card,
    fontSize: 12,
  },
  piBrowserButton: {
    backgroundColor: '#7D4698', // Pi's purple color
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  piBrowserButtonText: {
    color: colors.card,
    fontSize: 12,
    marginLeft: 4,
  },
});
