import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Heart, ArrowLeft, Search, Filter, Gift, RefreshCw, ExternalLink } from 'lucide-react-native';
import { journalists } from '@/mocks/journalists';
import { mockDonations } from '@/mocks/donations';
import { formatDate } from '@/utils/date-formatter';
import { 
  platformPiPayment, 
  isPiSDKInitialized, 
  forceReloadPiSDK,
  loadPiSDKDirectly,
  isRunningInPiBrowser,
  PI_BROWSER_URL,
  openPiBrowser
} from '@/utils/pi-sdk';
import { Journalist } from '@/types/journalist';
import { Donation, PaymentStatus } from '@/types/payment';

export default function DonationsScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJournalists, setFilteredJournalists] = useState<Journalist[]>(journalists);
  const [selectedJournalist, setSelectedJournalist] = useState<Journalist | null>(null);
  const [donationAmount, setDonationAmount] = useState('1');
  const [donationMessage, setDonationMessage] = useState('');
  const [donationHistory, setDonationHistory] = useState(mockDonations);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [processingDonation, setProcessingDonation] = useState(false);
  const [piSdkReady, setPiSdkReady] = useState(false);
  const [piSdkError, setPiSdkError] = useState<string | null>(null);
  const [checkingPiSdk, setCheckingPiSdk] = useState(false);
  const [showDirectLoadButton, setShowDirectLoadButton] = useState(false);
  const [isInPiBrowser, setIsInPiBrowser] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
    
    // Filter journalists based on search query
    if (searchQuery) {
      const filtered = journalists.filter(journalist => 
        journalist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJournalists(filtered);
    } else {
      setFilteredJournalists(journalists);
    }
    
    // Check if running in Pi Browser
    if (Platform.OS === 'web') {
      const inPiBrowser = isRunningInPiBrowser();
      setIsInPiBrowser(inPiBrowser);
      console.log('DonationsScreen - Running in Pi Browser:', inPiBrowser);
    }
    
    // Check Pi SDK availability
    if (Platform.OS === 'web') {
      checkPiSdkAvailability();
    } else {
      setPiSdkReady(true); // Mock implementation will be used
    }
  }, [isAuthenticated, searchQuery]);
  
  const checkPiSdkAvailability = async () => {
    try {
      setCheckingPiSdk(true);
      setPiSdkError(null);
      setShowDirectLoadButton(false);
      
      // Check if Pi SDK is already initialized
      if (isPiSDKInitialized()) {
        console.log('Pi SDK is already initialized in DonationsScreen');
        setPiSdkReady(true);
        setCheckingPiSdk(false);
        return;
      }
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setPiSdkError('For the best experience with Pi Network donations, please open this app in the Pi Browser.');
      } else {
        setPiSdkError('Pi SDK is not initialized. Please initialize it to make donations.');
      }
      
      setPiSdkReady(false);
      setShowDirectLoadButton(true);
    } catch (error) {
      console.error('Error checking Pi SDK availability:', error);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setPiSdkError('For the best experience with Pi Network donations, please open this app in the Pi Browser.');
      } else {
        setPiSdkError('Error checking Pi SDK availability. Please try again later.');
      }
      
      setPiSdkReady(false);
      setShowDirectLoadButton(true);
    } finally {
      setCheckingPiSdk(false);
    }
  };
  
  const handleRetryPiSDK = async () => {
    try {
      setCheckingPiSdk(true);
      setPiSdkError('Retrying Pi SDK initialization...');
      setShowDirectLoadButton(false);
      
      // Force reload the Pi SDK
      const result = await forceReloadPiSDK();
      
      if (result) {
        console.log('Pi SDK reloaded successfully in DonationsScreen');
        setPiSdkReady(true);
        setPiSdkError(null);
      } else {
        console.log('Pi SDK reload failed in DonationsScreen');
        
        // If not in Pi Browser, show a more specific error message
        if (!isInPiBrowser) {
          setPiSdkError('For the best experience with Pi Network donations, please open this app in the Pi Browser.');
        } else {
          setPiSdkError('Pi SDK initialization failed. Please try direct loading or refresh the page.');
        }
        
        setShowDirectLoadButton(true);
      }
    } catch (error) {
      console.error('Failed to retry Pi SDK initialization:', error);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setPiSdkError('For the best experience with Pi Network donations, please open this app in the Pi Browser.');
      } else {
        setPiSdkError(`Pi SDK retry error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setShowDirectLoadButton(true);
    } finally {
      setCheckingPiSdk(false);
    }
  };
  
  const handleDirectLoad = () => {
    setCheckingPiSdk(true);
    setPiSdkError('Trying direct load of Pi SDK...');
    setShowDirectLoadButton(false);
    
    try {
      // Load Pi SDK directly
      loadPiSDKDirectly();
      
      // Check if it worked after a short delay
      setTimeout(() => {
        if (isPiSDKInitialized()) {
          console.log('Pi SDK loaded directly successfully in DonationsScreen');
          setPiSdkReady(true);
          setPiSdkError(null);
        } else {
          console.log('Direct load of Pi SDK failed in DonationsScreen');
          
          // If not in Pi Browser, show a more specific error message
          if (!isInPiBrowser) {
            setPiSdkError('For the best experience with Pi Network donations, please open this app in the Pi Browser.');
          } else {
            setPiSdkError('Direct load of Pi SDK failed. Please try visiting the Pi Browser directly.');
          }
          
          setShowDirectLoadButton(false);
        }
        setCheckingPiSdk(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to direct load Pi SDK:', error);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setPiSdkError('For the best experience with Pi Network donations, please open this app in the Pi Browser.');
      } else {
        setPiSdkError(`Pi SDK direct load error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setShowDirectLoadButton(false);
      setCheckingPiSdk(false);
    }
  };
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };
  
  const handleSelectJournalist = (journalist: Journalist) => {
    setSelectedJournalist(journalist);
    setShowDonationForm(true);
  };
  
  const handleDonationAmountChange = (text: string) => {
    // Only allow numbers and up to 2 decimal places
    const regex = /^\d+(\.\d{0,2})?$/;
    if (text === '' || regex.test(text)) {
      setDonationAmount(text);
    }
  };
  
  const handleMakeDonation = async () => {
    if (!selectedJournalist) {
      Alert.alert('Error', 'Please select a journalist to donate to.');
      return;
    }
    
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid donation amount.');
      return;
    }
    
    if (Platform.OS === 'web' && !piSdkReady) {
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        Alert.alert(
          'Pi Browser Required',
          'For the best experience with Pi Network donations, please open this app in the Pi Browser.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Pi Browser', onPress: openPiBrowser }
          ]
        );
      } else {
        Alert.alert('Error', 'Pi SDK is not available. Please try again later.');
      }
      return;
    }
    
    setProcessingDonation(true);
    
    try {
      // Call Pi SDK to make payment
      const paymentResult = await platformPiPayment(
        parseFloat(donationAmount),
        `Donation to ${selectedJournalist?.name || 'journalist'}${donationMessage ? ': ' + donationMessage : ''}`,
        {
          type: 'donation',
          journalistId: selectedJournalist?.id || '',
          userId: user?.id || 'anonymous',
          message: donationMessage,
        }
      );
      
      // Add to donation history
      const newDonation: Donation = {
        id: Date.now().toString(),
        amount: parseFloat(donationAmount),
        journalistId: selectedJournalist?.id || '',
        journalistName: selectedJournalist?.name || '',
        journalistAvatar: selectedJournalist?.avatarUrl || '',
        message: donationMessage,
        date: new Date().toISOString(),
        status: 'completed',
      };
      
      setDonationHistory([newDonation, ...donationHistory]);
      
      // Reset form
      setDonationAmount('1');
      setDonationMessage('');
      setShowDonationForm(false);
      setSelectedJournalist(null);
      
      Alert.alert(
        'Donation Successful',
        `Thank you for your donation of ${donationAmount} Pi to ${selectedJournalist?.name || 'the journalist'}!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Donation error:', error);
      Alert.alert(
        'Donation Failed',
        'There was an error processing your donation. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessingDonation(false);
    }
  };
  
  const handleBack = () => {
    if (showDonationForm) {
      setShowDonationForm(false);
      setSelectedJournalist(null);
    } else {
      router.back();
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showDonationForm ? 'Make a Donation' : 'Support Journalists'}
        </Text>
      </View>
      
      {Platform.OS === 'web' && !piSdkReady && (
        <View style={styles.piSdkErrorContainer}>
          <Text style={styles.piSdkErrorText}>
            {piSdkError || 'Pi SDK is not available. Please initialize it to make donations.'}
          </Text>
          <View style={styles.piSdkButtonsContainer}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetryPiSDK}
              disabled={checkingPiSdk}
            >
              {checkingPiSdk ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <RefreshCw size={14} color={colors.primary} />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </>
              )}
            </TouchableOpacity>
            
            {showDirectLoadButton && (
              <TouchableOpacity 
                style={styles.directLoadButton}
                onPress={handleDirectLoad}
                disabled={checkingPiSdk}
              >
                <Text style={styles.directLoadButtonText}>Direct Load</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.piBrowserButton}
              onPress={openPiBrowser}
              disabled={checkingPiSdk}
            >
              <ExternalLink size={14} color="#7D4698" />
              <Text style={styles.piBrowserButtonText}>Open Pi Browser</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {!showDonationForm ? (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={colors.text} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search journalists..."
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor={colors.text}
              />
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            <Gift size={24} color={colors.primary} />
            <Text style={styles.infoText}>
              Support your favorite journalists by donating Pi. 100% of your donation goes directly to the journalist.
            </Text>
          </View>
          
          <Text style={styles.sectionTitle}>Journalists</Text>
          
          {filteredJournalists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No journalists found matching your search.</Text>
            </View>
          ) : (
            filteredJournalists.map((journalist) => (
              <TouchableOpacity
                key={journalist.id}
                style={styles.journalistCard}
                onPress={() => handleSelectJournalist(journalist)}
                disabled={Platform.OS === 'web' && !piSdkReady}
              >
                <Image
                  source={{ uri: journalist.avatarUrl }}
                  style={styles.journalistAvatar}
                />
                <View style={styles.journalistInfo}>
                  <Text style={styles.journalistName}>{journalist.name}</Text>
                  <Text style={styles.journalistBio} numberOfLines={2}>
                    {journalist.bio || 'Journalist at Trend Forge'}
                  </Text>
                  <View style={styles.expertiseContainer}>
                    {journalist.expertise.slice(0, 2).map((expertise, index) => (
                      <View key={index} style={styles.expertiseTag}>
                        <Text style={styles.expertiseText}>{expertise}</Text>
                      </View>
                    ))}
                    {journalist.expertise.length > 2 && (
                      <Text style={styles.moreText}>+{journalist.expertise.length - 2}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.donateButton,
                    (Platform.OS === 'web' && !piSdkReady) && styles.disabledButton
                  ]}
                  onPress={() => handleSelectJournalist(journalist)}
                  disabled={Platform.OS === 'web' && !piSdkReady}
                >
                  <Text style={styles.donateButtonText}>Donate</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
          
          <Text style={styles.sectionTitle}>Your Donation History</Text>
          
          {donationHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>You haven't made any donations yet.</Text>
            </View>
          ) : (
            donationHistory.map((donation) => (
              <View key={donation.id} style={styles.donationCard}>
                <Image
                  source={{ uri: donation.journalistAvatar }}
                  style={styles.donationAvatar}
                />
                <View style={styles.donationInfo}>
                  <Text style={styles.donationAmount}>{donation.amount} Pi</Text>
                  <Text style={styles.donationRecipient}>
                    To: {donation.journalistName}
                  </Text>
                  {donation.message && (
                    <Text style={styles.donationMessage} numberOfLines={2}>
                      "{donation.message}"
                    </Text>
                  )}
                  <Text style={styles.donationDate}>
                    {formatDate(donation.date)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.donationStatus,
                    donation.status === 'completed'
                      ? styles.statusCompleted
                      : styles.statusPending
                  ]}
                >
                  <Text style={styles.statusText}>
                    {donation.status === 'completed' ? 'Completed' : 'Pending'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </>
      ) : (
        <View style={styles.donationFormContainer}>
          {selectedJournalist && (
            <>
              <View style={styles.selectedJournalistContainer}>
                <Image
                  source={{ uri: selectedJournalist.avatarUrl }}
                  style={styles.selectedJournalistAvatar}
                />
                <View style={styles.selectedJournalistInfo}>
                  <Text style={styles.selectedJournalistName}>
                    {selectedJournalist.name}
                  </Text>
                  <Text style={styles.selectedJournalistBio} numberOfLines={2}>
                    {selectedJournalist.bio || 'Journalist at Trend Forge'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Donation Amount (Pi)</Text>
                <TextInput
                  style={styles.amountInput}
                  value={donationAmount}
                  onChangeText={handleDonationAmountChange}
                  keyboardType="decimal-pad"
                  placeholder="1.00"
                  placeholderTextColor={colors.text}
                />
              </View>
              
              <View style={styles.quickAmounts}>
                {[1, 5, 10, 25].map(amount => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.quickAmountButton,
                      parseFloat(donationAmount) === amount && styles.selectedAmount
                    ]}
                    onPress={() => setDonationAmount(amount.toString())}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        parseFloat(donationAmount) === amount && styles.selectedAmountText
                      ]}
                    >
                      {amount} Pi
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Message (Optional)</Text>
                <TextInput
                  style={styles.messageInput}
                  value={donationMessage}
                  onChangeText={setDonationMessage}
                  placeholder="Add a message of support..."
                  placeholderTextColor={colors.text}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
                <Text style={styles.characterCount}>
                  {donationMessage.length}/200
                </Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (processingDonation || (Platform.OS === 'web' && !piSdkReady)) && styles.disabledButton
                ]}
                onPress={handleMakeDonation}
                disabled={processingDonation || (Platform.OS === 'web' && !piSdkReady)}
              >
                {processingDonation ? (
                  <ActivityIndicator size="small" color={colors.card} />
                ) : (
                  <>
                    <Heart size={20} color={colors.card} />
                    <Text style={styles.submitButtonText}>
                      Donate {donationAmount} Pi
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <Text style={styles.donationDisclaimer}>
                100% of your donation goes directly to the journalist. Donations are processed through Pi Network and are subject to their terms and conditions.
              </Text>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...typography.h2,
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // To center the title accounting for the back button
  },
  piSdkErrorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  piSdkErrorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  piSdkButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  retryButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: 4,
  },
  directLoadButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  directLoadButtonText: {
    ...typography.bodySmall,
    color: colors.secondary,
  },
  piBrowserButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "#7D4698", // Pi's purple color
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  piBrowserButtonText: {
    ...typography.bodySmall,
    color: "#7D4698", // Pi's purple color
    marginLeft: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    ...typography.body,
    flex: 1,
    marginLeft: 12,
    color: colors.text,
  },
  sectionTitle: {
    ...typography.h3,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  journalistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  journalistAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  journalistInfo: {
    flex: 1,
  },
  journalistName: {
    ...typography.h4,
    marginBottom: 4,
  },
  journalistBio: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: 8,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  expertiseTag: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expertiseText: {
    ...typography.caption,
    color: colors.text,
  },
  moreText: {
    ...typography.caption,
    color: colors.primary,
  },
  donateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: colors.inactive || '#cccccc',
  },
  donateButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 14,
  },
  donationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  donationAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  donationInfo: {
    flex: 1,
  },
  donationAmount: {
    ...typography.h4,
    color: colors.primary,
  },
  donationRecipient: {
    ...typography.bodySmall,
    color: colors.text,
  },
  donationMessage: {
    ...typography.bodySmall,
    color: colors.text,
    fontStyle: 'italic',
    marginTop: 4,
  },
  donationDate: {
    ...typography.caption,
    color: colors.text,
    marginTop: 4,
  },
  donationStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusCompleted: {
    backgroundColor: colors.success + '20', // 20% opacity
  },
  statusPending: {
    backgroundColor: colors.warning + '20', // 20% opacity
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  donationFormContainer: {
    padding: 16,
  },
  selectedJournalistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedJournalistAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  selectedJournalistInfo: {
    flex: 1,
  },
  selectedJournalistName: {
    ...typography.h3,
    marginBottom: 8,
  },
  selectedJournalistBio: {
    ...typography.body,
    color: colors.text,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  amountInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: colors.text,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAmountButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  selectedAmount: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickAmountText: {
    fontWeight: '600',
    color: colors.text,
  },
  selectedAmountText: {
    color: colors.card,
  },
  messageInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 8,
  },
  donationDisclaimer: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
});
