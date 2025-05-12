import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { X, Play, Volume2, VolumeX } from 'lucide-react-native';
import { isRunningInPiBrowser, PI_BROWSER_URL, showPiAd } from '@/utils/pi-sdk';
import { Platform, Linking } from 'react-native';

interface PiAdBannerProps {
  position: 'top' | 'middle' | 'bottom';
  onClose?: () => void;
  onAdWatched?: () => void;
  required?: boolean;
}

export default function PiAdBanner({ position, onClose, onAdWatched, required = false }: PiAdBannerProps) {
  const [showModal, setShowModal] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  const [adWatchTime, setAdWatchTime] = useState(0);
  const [adCompleted, setAdCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInPiBrowser, setIsInPiBrowser] = useState(false);
  const [showPiBrowserPrompt, setShowPiBrowserPrompt] = useState(false);

  useEffect(() => {
    // Check if running in Pi Browser
    if (Platform.OS === 'web') {
      const inPiBrowser = isRunningInPiBrowser();
      setIsInPiBrowser(inPiBrowser);
    }
  }, []);

  // Simulate watching an ad
  const handleWatchAd = async () => {
    if (Platform.OS === 'web' && !isInPiBrowser) {
      setShowPiBrowserPrompt(true);
      return;
    }

    setLoading(true);
    
    try {
      // In a real implementation, this would use the actual Pi ad SDK
      const result = await showPiAd('rewarded');
      console.log('Pi ad shown:', result);
      
      // Automatically start the ad
      setLoading(false);
      setShowModal(true);
      setAdWatchTime(0);
      setAdCompleted(false);
      setIsPlaying(true);
      
      // Simulate ad progress - in a real implementation, this would be handled by the Pi SDK
      const interval = setInterval(() => {
        setAdWatchTime(prev => {
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
      console.error('Error showing Pi ad:', error);
      setLoading(false);
      alert('Failed to show ad. Please try again.');
    }
  };

  const handleAdComplete = () => {
    setShowModal(false);
    setAdWatched(true);
    if (onAdWatched) {
      onAdWatched();
    }
  };

  const handleClose = () => {
    if (required) {
      // If ad is required, don't allow closing without watching
      alert("You need to watch this ad to continue reading the article.");
      return;
    }
    
    setShowModal(false);
    if (onClose) {
      onClose();
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    // If paused, don't progress the timer
    if (isPlaying) {
      // Pausing the "video"
    } else {
      // Resuming the "video"
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const openPiBrowser = () => {
    setShowPiBrowserPrompt(false);
    
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

  // Different ad content based on position
  const getAdContent = () => {
    switch (position) {
      case 'top':
        return {
          title: 'Pi Network Wallet',
          description: 'Secure your Pi with the official Pi Network Wallet',
          image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        };
      case 'middle':
        return {
          title: 'Pi Browser',
          description: 'Explore the Pi ecosystem with Pi Browser',
          image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
        };
      case 'bottom':
        return {
          title: 'Pi Marketplace',
          description: 'Buy and sell goods with Pi',
          image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        };
      default:
        return {
          title: 'Pi Network',
          description: 'Join the Pi Network community',
          image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        };
    }
  };

  const adContent = getAdContent();

  if (adWatched) {
    return null;
  }

  return (
    <>
      <View style={[styles.container, styles[position]]}>
        <View style={styles.adContent}>
          <Image 
            source={{ uri: adContent.image }} 
            style={styles.adImage}
            resizeMode="cover"
          />
          <View style={styles.adTextContainer}>
            <Text style={styles.adTitle}>{adContent.title}</Text>
            <Text style={styles.adDescription}>{adContent.description}</Text>
          </View>
        </View>
        <View style={styles.adActions}>
          <TouchableOpacity 
            style={styles.watchButton}
            onPress={handleWatchAd}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.card} />
            ) : (
              <Text style={styles.watchButtonText}>Watch Video Ad</Text>
            )}
          </TouchableOpacity>
          {!required && onClose && (
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <X size={16} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

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
              style={styles.piBrowserButton}
              onPress={openPiBrowser}
            >
              <Text style={styles.piBrowserButtonText}>Open in Pi Browser</Text>
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
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => required ? null : setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pi Network Ad</Text>
              {!required && (
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowModal(false)}
                >
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.videoContainer}>
              <Image 
                source={{ uri: adContent.image }} 
                style={styles.videoPlaceholder}
                resizeMode="cover"
              />
              
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
            
            <Text style={styles.modalAdTitle}>{adContent.title}</Text>
            <Text style={styles.modalAdDescription}>
              {adContent.description}
              {"\n\n"}
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
                {adCompleted ? 'Continue Reading' : 'Please watch the entire ad...'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: {
    marginTop: 16,
  },
  middle: {
    marginVertical: 16,
  },
  bottom: {
    marginBottom: 16,
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  adImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  adTextContainer: {
    flex: 1,
  },
  adTitle: {
    ...typography.h4,
    marginBottom: 4,
  },
  adDescription: {
    ...typography.bodySmall,
    color: colors.text,
  },
  adActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  watchButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  watchButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
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
  videoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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
  modalAdTitle: {
    ...typography.h3,
    marginBottom: 8,
  },
  modalAdDescription: {
    ...typography.body,
    marginBottom: 16,
  },
  progressContainer: {
    height: 24,
    backgroundColor: colors.gray100,
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
  disabledButton: {
    backgroundColor: colors.gray300,
  },
  completeButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
  piBrowserButton: {
    backgroundColor: '#7D4698', // Pi's purple color
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  piBrowserButtonText: {
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
});
