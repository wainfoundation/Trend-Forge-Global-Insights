import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  Modal,
} from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { 
  showPiAd, 
  isPiAdReady, 
  requestPiAd, 
  initPiSDK, 
  isPiSDKInitialized,
  forceReloadPiSDK,
  loadPiSDKDirectly,
  isRunningInPiBrowser,
  PI_BROWSER_URL,
  openPiBrowser
} from "@/utils/pi-sdk";
import { useAuthStore } from "@/store/auth-store";
import { Gift, RefreshCw, ExternalLink, Play, Volume2, VolumeX, X } from "lucide-react-native";

interface RewardedAdButtonProps {
  onReward?: (adId: string) => void;
  buttonText?: string;
  rewardText?: string;
}

export default function RewardedAdButton({ 
  onReward, 
  buttonText = "Watch Ad for Reward", 
  rewardText = "You've earned a reward!" 
}: RewardedAdButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [adShown, setAdShown] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [adReady, setAdReady] = useState(false);
  const [piSdkReady, setPiSdkReady] = useState(false);
  const [checkingPiSdk, setCheckingPiSdk] = useState(false);
  const [showDirectLoadButton, setShowDirectLoadButton] = useState(false);
  const [isInPiBrowser, setIsInPiBrowser] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adWatchTime, setAdWatchTime] = useState(0);
  const [adCompleted, setAdCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPiBrowserPrompt, setShowPiBrowserPrompt] = useState(false);
  
  // Check if Pi SDK and ad are ready when component mounts
  useEffect(() => {
    // Check if running in Pi Browser
    if (Platform.OS === 'web') {
      const inPiBrowser = isRunningInPiBrowser();
      setIsInPiBrowser(inPiBrowser);
      console.log('RewardedAdButton - Running in Pi Browser:', inPiBrowser);
    }
    
    checkPiSdkAndAdAvailability();
  }, []);
  
  const checkPiSdkAndAdAvailability = async () => {
    try {
      setCheckingPiSdk(true);
      setAdError(null);
      setShowDirectLoadButton(false);
      
      if (Platform.OS === 'web') {
        // Check if Pi SDK is already initialized
        if (isPiSDKInitialized()) {
          console.log('Pi SDK is already initialized in RewardedAdButton');
          setPiSdkReady(true);
          
          // Check if ad is ready
          const isReady = await isPiAdReady("rewarded");
          setAdReady(isReady);
          
          if (!isReady) {
            // If ad is not ready, request one
            try {
              const result = await requestPiAd("rewarded");
              if (result.result === "AD_LOADED") {
                setAdReady(true);
              }
            } catch (error) {
              console.error("Error requesting ad:", error);
              // For demo purposes, we'll still set adReady to true
              setAdReady(true);
            }
          }
          
          setCheckingPiSdk(false);
          return;
        }
        
        // Try to initialize Pi SDK if it's not already initialized
        const initialized = await initPiSDK();
        setPiSdkReady(initialized);
        
        if (!initialized) {
          // If not in Pi Browser, show a more specific error message
          if (!isInPiBrowser) {
            setAdError("For the best experience with Pi Network ads, please open this app in the Pi Browser.");
          } else {
            setAdError("Pi SDK is not available. Ads cannot be shown.");
          }
          
          setAdReady(false);
          setShowDirectLoadButton(true);
          setCheckingPiSdk(false);
          return;
        }
        
        // Check if ad is ready
        const isReady = await isPiAdReady("rewarded");
        setAdReady(isReady);
        
        if (!isReady) {
          // If ad is not ready, request one
          try {
            const result = await requestPiAd("rewarded");
            if (result.result === "AD_LOADED") {
              setAdReady(true);
            }
          } catch (error) {
            console.error("Error requesting ad:", error);
            // For demo purposes, we'll still set adReady to true
            setAdReady(true);
          }
        }
      } else {
        // For non-web platforms, we'll use mock implementations
        setAdReady(true);
        setPiSdkReady(true);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      // Even if there's an error, we'll set adReady to true for demo purposes on non-web
      if (Platform.OS !== 'web') {
        setAdReady(true);
        setPiSdkReady(true);
      } else {
        // If not in Pi Browser, show a more specific error message
        if (!isInPiBrowser) {
          setAdError("For the best experience with Pi Network ads, please open this app in the Pi Browser.");
        } else {
          setAdError("Error checking ad availability. Please try again later.");
        }
        
        setShowDirectLoadButton(true);
      }
    } finally {
      setCheckingPiSdk(false);
    }
  };
  
  const handleRetryPiSDK = async () => {
    try {
      setCheckingPiSdk(true);
      setAdError("Retrying Pi SDK initialization...");
      setShowDirectLoadButton(false);
      
      // Force reload the Pi SDK
      const result = await forceReloadPiSDK();
      
      if (result) {
        setPiSdkReady(true);
        setAdError(null);
        
        // Check if ad is ready
        const isReady = await isPiAdReady("rewarded");
        setAdReady(isReady);
        
        if (!isReady) {
          // If ad is not ready, request one
          try {
            const result = await requestPiAd("rewarded");
            if (result.result === "AD_LOADED") {
              setAdReady(true);
            }
          } catch (error) {
            console.error("Error requesting ad:", error);
            // For demo purposes, we'll still set adReady to true
            setAdReady(true);
          }
        }
      } else {
        // If not in Pi Browser, show a more specific error message
        if (!isInPiBrowser) {
          setAdError("For the best experience with Pi Network ads, please open this app in the Pi Browser.");
        } else {
          setAdError("Pi SDK initialization failed. Please try direct loading or refreshing the page.");
        }
        
        setShowDirectLoadButton(true);
      }
    } catch (error) {
      console.error("Error retrying Pi SDK:", error);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setAdError("For the best experience with Pi Network ads, please open this app in the Pi Browser.");
      } else {
        setAdError("Error initializing Pi SDK. Please try again later.");
      }
      
      setShowDirectLoadButton(true);
    } finally {
      setCheckingPiSdk(false);
    }
  };
  
  const handleDirectLoad = () => {
    setCheckingPiSdk(true);
    setAdError("Trying direct load of Pi SDK...");
    setShowDirectLoadButton(false);
    
    try {
      // Load Pi SDK directly
      loadPiSDKDirectly();
      
      // Check if it worked after a short delay
      setTimeout(() => {
        if (isPiSDKInitialized()) {
          console.log('Pi SDK loaded directly successfully');
          setPiSdkReady(true);
          setAdError(null);
          
          // Check if ad is ready
          isPiAdReady("rewarded").then(isReady => {
            setAdReady(isReady);
            
            if (!isReady) {
              // If ad is not ready, request one
              requestPiAd("rewarded").then(result => {
                if (result.result === "AD_LOADED") {
                  setAdReady(true);
                }
              }).catch(error => {
                console.error("Error requesting ad:", error);
                // For demo purposes, we'll still set adReady to true
                setAdReady(true);
              });
            }
          });
        } else {
          console.log('Direct load of Pi SDK failed');
          
          // If not in Pi Browser, show a more specific error message
          if (!isInPiBrowser) {
            setAdError("For the best experience with Pi Network ads, please open this app in the Pi Browser.");
          } else {
            setAdError('Direct load of Pi SDK failed. Please try visiting the Pi Browser directly.');
          }
          
          setShowDirectLoadButton(false);
        }
        setCheckingPiSdk(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to direct load Pi SDK:', error);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setAdError("For the best experience with Pi Network ads, please open this app in the Pi Browser.");
      } else {
        setAdError(`Pi SDK direct load error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setShowDirectLoadButton(false);
      setCheckingPiSdk(false);
    }
  };
  
  const handleShowAd = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to view ads and earn rewards.",
        [{ text: "OK" }]
      );
      return;
    }
    
    if (Platform.OS === 'web' && !piSdkReady) {
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setShowPiBrowserPrompt(true);
        return;
      } else {
        setAdError("Pi SDK is not available. Please try again later.");
      }
      return;
    }
    
    setLoading(true);
    setAdError(null);
    
    try {
      // In a real implementation, this would use the actual Pi ad SDK
      const result = await showPiAd('rewarded');
      console.log('Pi ad shown:', result);
      
      // Automatically start the ad
      setLoading(false);
      setShowAdModal(true);
      setAdWatchTime(0);
      setAdCompleted(false);
      setIsPlaying(true);
      
      // Simulate ad progress - in a real implementation, this would be handled by the Pi SDK
      const interval = setInterval(() => {
        setAdWatchTime(prev => {
          if (!isPlaying) return prev; // Don't increment if paused
          
          const newTime = prev + 1;
          if (newTime >= 15) {
            clearInterval(interval);
            setAdCompleted(true);
            // Automatically complete the ad after it finishes
            setTimeout(() => {
              handleAdComplete();
            }, 1000);
            return 15;
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error("Error showing ad:", error);
      setAdError("An unexpected error occurred. Please try again later.");
      setLoading(false);
    }
  };
  
  const handleAdComplete = () => {
    setShowAdModal(false);
    setAdShown(true);
    
    // Call onReward callback with a mock adId
    if (onReward) {
      onReward(`mock-ad-${Date.now()}`);
    }
    
    // Request a new ad for next time
    requestPiAd("rewarded");
  };
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const openPiBrowserHandler = () => {
    setShowPiBrowserPrompt(false);
    openPiBrowser();
  };
  
  return (
    <View style={styles.container}>
      {adShown ? (
        <View style={styles.rewardContainer}>
          <Gift size={24} color={colors.success} style={styles.rewardIcon} />
          <Text style={styles.rewardText}>{rewardText}</Text>
        </View>
      ) : (
        <>
          {adError && (
            <Text style={styles.errorText}>{adError}</Text>
          )}
          
          <TouchableOpacity 
            style={[
              styles.button,
              (!adReady || (Platform.OS === 'web' && !piSdkReady) || loading || checkingPiSdk) && styles.disabledButton
            ]}
            onPress={handleShowAd}
            disabled={loading || !adReady || (Platform.OS === 'web' && !piSdkReady) || checkingPiSdk}
          >
            {loading || checkingPiSdk ? (
              <ActivityIndicator size="small" color={colors.card} />
            ) : (
              <>
                <Gift size={16} color={colors.card} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>
                  {Platform.OS === 'web' && !piSdkReady 
                    ? "Pi SDK not available" 
                    : buttonText}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {!adReady && !adError && piSdkReady && !checkingPiSdk && (
            <Text style={styles.loadingText}>Loading rewarded ad...</Text>
          )}
          
          {Platform.OS === 'web' && !piSdkReady && !checkingPiSdk && (
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={handleRetryPiSDK}
                disabled={checkingPiSdk}
              >
                <RefreshCw size={14} color={colors.primary} />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
              
              {showDirectLoadButton && (
                <TouchableOpacity 
                  style={styles.directLoadButton}
                  onPress={handleDirectLoad}
                  disabled={checkingPiSdk}
                >
                  <Text style={styles.directLoadText}>Direct Load</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.piBrowserButton}
                onPress={openPiBrowser}
                disabled={checkingPiSdk}
              >
                <ExternalLink size={14} color="#7D4698" />
                <Text style={styles.piBrowserText}>Pi Browser</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
      
      {/* Pi Browser Prompt Modal */}
      <Modal
        visible={showPiBrowserPrompt}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPiBrowserPrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pi Browser Required</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowPiBrowserPrompt(false)}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalAdDescription}>
              To watch Pi Network ads and access all features, please open this app in the Pi Browser.
            </Text>
            
            <TouchableOpacity 
              style={styles.piBrowserModalButton}
              onPress={openPiBrowserHandler}
            >
              <Text style={styles.piBrowserModalButtonText}>Open in Pi Browser</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowPiBrowserPrompt(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Ad Video Modal */}
      <Modal
        visible={showAdModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAdModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pi Network Ad</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowAdModal(false)}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.videoContainer}>
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoText}>Pi Network Video Ad</Text>
              </View>
              
              {/* Video Controls Overlay */}
              <View style={styles.videoControls}>
                <TouchableOpacity 
                  style={styles.playPauseButton}
                  onPress={togglePlayPause}
                >
                  {isPlaying ? (
                    <View style={styles.pauseIcon}>
                      <View style={styles.pauseBar}></View>
                      <View style={styles.pauseBar}></View>
                    </View>
                  ) : (
                    <Play size={24} color="white" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.muteButton}
                  onPress={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX size={20} color="white" />
                  ) : (
                    <Volume2 size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.modalAdTitle}>Pi Network Rewards</Text>
            <Text style={styles.modalAdDescription}>
              Learn more about how Pi Network is building a secure and inclusive digital currency for everyday people.
            </Text>
            
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${(adWatchTime / 15) * 100}%` }
                ]} 
              />
              <Text style={styles.progressText}>
                {adCompleted ? 'Ad completed!' : `${isPlaying ? 'Watching' : 'Paused'}: ${adWatchTime}/15 seconds`}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.completeButton,
                !adCompleted && styles.disabledButton
              ]}
              onPress={handleAdComplete}
              disabled={!adCompleted}
            >
              <Text style={styles.completeButtonText}>
                {adCompleted ? 'Claim Reward' : 'Please watch the entire ad...'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 12,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
  },
  disabledButton: {
    backgroundColor: colors.inactive || '#cccccc',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: colors.card,
    fontWeight: "500",
    fontSize: 14,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: 8,
    textAlign: "center",
    maxWidth: 300,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 8,
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  retryText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: 4,
  },
  directLoadButton: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success + "20", // 20% opacity
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  rewardIcon: {
    marginRight: 8,
  },
  rewardText: {
    ...typography.body,
    color: colors.success,
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...typography.h3,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalAdTitle: {
    ...typography.h3,
    marginTop: 16,
    marginBottom: 8,
  },
  modalAdDescription: {
    ...typography.body,
    marginBottom: 16,
  },
  piBrowserModalButton: {
    backgroundColor: '#7D4698', // Pi's purple color
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  piBrowserModalButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7D4698', // Pi's purple color
  },
  videoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  playPauseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: {
    flexDirection: 'row',
    width: 18,
    height: 18,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pauseBar: {
    width: 4,
    height: 16,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  muteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 24,
    backgroundColor: colors.gray100 || '#f1f1f1',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    position: 'absolute',
    left: 0,
  },
  progressText: {
    ...typography.caption,
    textAlign: 'center',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
});
