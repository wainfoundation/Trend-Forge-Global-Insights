import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Platform, Linking } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { X, Eye, ExternalLink } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { 
  showPiAd, 
  isRunningInPiBrowser, 
  PI_BROWSER_URL 
} from '@/utils/pi-sdk';

interface ArticleLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  articleId: string;
}

export default function ArticleLimitModal({ visible, onClose, onSuccess, articleId }: ArticleLimitModalProps) {
  const [loading, setLoading] = useState(false);
  const [adWatchTime, setAdWatchTime] = useState(0);
  const [adCompleted, setAdCompleted] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInPiBrowser, setIsInPiBrowser] = useState(false);
  const [showPiBrowserPrompt, setShowPiBrowserPrompt] = useState(false);
  
  const { markAdWatched } = useAuthStore();

  useEffect(() => {
    // Check if running in Pi Browser
    if (Platform.OS === 'web') {
      const inPiBrowser = isRunningInPiBrowser();
      setIsInPiBrowser(inPiBrowser);
    }
  }, []);

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
      console.error('Error showing Pi ad:', error);
      setLoading(false);
      alert('Failed to show ad. Please try again.');
    }
  };

  const handleAdComplete = () => {
    setShowAdModal(false);
    
    // Mark this article as having had an ad watched
    markAdWatched(articleId);
    onSuccess();
    onClose();
  };

  const handleSubscribe = () => {
    onClose();
    // Navigate to subscription page
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

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            
            <Text style={styles.title}>Article Limit Reached</Text>
            
            <Text style={styles.description}>
              You've reached your daily limit of free articles. Watch an ad to continue reading this article or subscribe to our premium plan for unlimited access.
            </Text>
            
            <TouchableOpacity 
              style={styles.watchButton}
              onPress={handleWatchAd}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.card} />
              ) : (
                <>
                  <Eye size={20} color={colors.card} />
                  <Text style={styles.watchButtonText}>Watch Video Ad to Continue</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={handleSubscribe}
            >
              <Text style={styles.subscribeButtonText}>Subscribe to Premium</Text>
            </TouchableOpacity>
            
            <Text style={styles.footnote}>
              Premium subscribers get unlimited access to all articles without ads.
            </Text>
          </View>
        </View>
      </Modal>
      
      {/* Pi Browser Prompt Modal */}
      <Modal
        visible={showPiBrowserPrompt}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPiBrowserPrompt(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowPiBrowserPrompt(false)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            
            <Text style={styles.title}>Pi Browser Required</Text>
            
            <Text style={styles.description}>
              To watch Pi Network ads and access all features, please open this app in the Pi Browser.
            </Text>
            
            <TouchableOpacity 
              style={styles.piBrowserButton}
              onPress={openPiBrowser}
            >
              <ExternalLink size={20} color={colors.card} />
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
        visible={showAdModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={styles.adContainer}>
            <View style={styles.adHeader}>
              <Text style={styles.adTitle}>Pi Network Ad</Text>
            </View>
            
            <View style={styles.videoContainer}>
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoText}>Pi Network Video Ad</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${(adWatchTime / 15) * 100}%` }
                ]} 
              />
              <Text style={styles.progressText}>
                {adCompleted ? 'Ad completed!' : `Watching ad: ${adWatchTime}/15 seconds`}
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.text,
  },
  watchButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  watchButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 8,
  },
  subscribeButton: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subscribeButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  footnote: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.text,
  },
  piBrowserButton: {
    backgroundColor: '#7D4698', // Pi's purple color
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  piBrowserButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  // Ad modal styles
  adContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  adHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  adTitle: {
    ...typography.h3,
    textAlign: 'center',
  },
  videoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
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
  progressContainer: {
    height: 24,
    backgroundColor: colors.gray100,
    margin: 16,
    borderRadius: 12,
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
    margin: 16,
    marginTop: 0,
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
});
