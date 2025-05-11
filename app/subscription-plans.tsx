import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { 
  platformPiPayment, 
  isPiSDKInitialized, 
  forceReloadPiSDK,
  loadPiSDKDirectly,
  isRunningInPiBrowser,
  PI_BROWSER_URL,
  openPiBrowser
} from "@/utils/pi-sdk";
import {
  Check,
  X,
  Lock,
  Zap,
  Newspaper,
  Bell,
  Award,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react-native";

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const { 
    username, 
    subscriptionPlan, 
    subscriptionStatus,
    subscriptionEndDate,
    setSubscription,
    renewSubscription,
    checkSubscriptionExpiration
  } = useAuthStore();
  const [loading, setLoading] = useState<"free" | "basic" | "premium" | null>(null);
  const [piSdkReady, setPiSdkReady] = useState(false);
  const [piSdkError, setPiSdkError] = useState<string | null>(null);
  const [checkingPiSdk, setCheckingPiSdk] = useState(false);
  const [showDirectLoadButton, setShowDirectLoadButton] = useState(false);
  const [isInPiBrowser, setIsInPiBrowser] = useState(false);
  
  // Use a ref to track if we've already checked the subscription
  // to prevent infinite loops
  const hasCheckedSubscription = useRef(false);
  
  // Check subscription expiration and Pi SDK availability when component mounts
  useEffect(() => {
    if (!hasCheckedSubscription.current) {
      checkSubscriptionExpiration();
      hasCheckedSubscription.current = true;
    }
    
    // Check if running in Pi Browser
    if (Platform.OS === 'web') {
      const inPiBrowser = isRunningInPiBrowser();
      setIsInPiBrowser(inPiBrowser);
      console.log('SubscriptionPlansScreen - Running in Pi Browser:', inPiBrowser);
    }
    
    // Check Pi SDK availability
    if (Platform.OS === 'web') {
      checkPiSdkAvailability();
    } else {
      setPiSdkReady(true); // Mock implementation will be used
    }
  }, []);
  
  const checkPiSdkAvailability = async () => {
    try {
      setCheckingPiSdk(true);
      setPiSdkError(null);
      setShowDirectLoadButton(false);
      
      // Check if Pi SDK is already initialized
      if (isPiSDKInitialized()) {
        console.log('Pi SDK is already initialized in SubscriptionPlansScreen');
        setPiSdkReady(true);
        setCheckingPiSdk(false);
        return;
      }
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setPiSdkError('For the best experience with Pi Network subscriptions, please open this app in the Pi Browser.');
      } else {
        setPiSdkError('Pi SDK is not initialized. Please initialize it to subscribe.');
      }
      
      setPiSdkReady(false);
      setShowDirectLoadButton(true);
    } catch (error) {
      console.error('Error checking Pi SDK availability:', error);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setPiSdkError('For the best experience with Pi Network subscriptions, please open this app in the Pi Browser.');
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
        console.log('Pi SDK reloaded successfully in SubscriptionPlansScreen');
        setPiSdkReady(true);
        setPiSdkError(null);
      } else {
        console.log('Pi SDK reload failed in SubscriptionPlansScreen');
        
        // If not in Pi Browser, show a more specific error message
        if (!isInPiBrowser) {
          setPiSdkError('For the best experience with Pi Network subscriptions, please open this app in the Pi Browser.');
        } else {
          setPiSdkError('Pi SDK initialization failed. Please try direct loading or refresh the page.');
        }
        
        setShowDirectLoadButton(true);
      }
    } catch (error) {
      console.error('Failed to retry Pi SDK initialization:', error);
      
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        setPiSdkError('For the best experience with Pi Network subscriptions, please open this app in the Pi Browser.');
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
          console.log('Pi SDK loaded directly successfully in SubscriptionPlansScreen');
          setPiSdkReady(true);
          setPiSdkError(null);
        } else {
          console.log('Direct load of Pi SDK failed in SubscriptionPlansScreen');
          
          // If not in Pi Browser, show a more specific error message
          if (!isInPiBrowser) {
            setPiSdkError('For the best experience with Pi Network subscriptions, please open this app in the Pi Browser.');
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
        setPiSdkError('For the best experience with Pi Network subscriptions, please open this app in the Pi Browser.');
      } else {
        setPiSdkError(`Pi SDK direct load error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setShowDirectLoadButton(false);
      setCheckingPiSdk(false);
    }
  };
  
  const isExpired = subscriptionStatus === "expired";
  const daysRemaining = subscriptionEndDate ? 
    Math.max(0, Math.ceil((new Date(subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 
    0;
  
  const handleSubscribe = async (plan: "free" | "basic" | "premium", amount: number) => {
    if (!username) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to subscribe to a plan.",
        [{ text: "OK" }]
      );
      return;
    }
    
    if (plan === "free") {
      setSubscription("free");
      router.back();
      return;
    }
    
    if (Platform.OS === 'web' && !piSdkReady) {
      // If not in Pi Browser, show a more specific error message
      if (!isInPiBrowser) {
        Alert.alert(
          'Pi Browser Required',
          'For the best experience with Pi Network subscriptions, please open this app in the Pi Browser.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Pi Browser', onPress: openPiBrowser }
          ]
        );
      } else {
        Alert.alert(
          "Pi SDK Not Available",
          "Please initialize Pi SDK to subscribe to a plan.",
          [{ text: "OK" }]
        );
      }
      return;
    }
    
    // If user is renewing the same plan, show confirmation
    if (plan === subscriptionPlan && isExpired) {
      Alert.alert(
        "Renew Subscription",
        `Would you like to renew your ${plan === "premium" ? "Premium" : "Basic"} subscription for ${amount} Pi?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Renew", 
            onPress: () => processPayment(plan, amount, true)
          }
        ]
      );
      return;
    }
    
    // If user is upgrading from basic to premium
    if (subscriptionPlan === "basic" && plan === "premium" && !isExpired) {
      Alert.alert(
        "Upgrade Subscription",
        "Would you like to upgrade to Premium for 10 Pi? Your Basic subscription will be replaced.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Upgrade", 
            onPress: () => processPayment(plan, amount, false)
          }
        ]
      );
      return;
    }
    
    // Regular subscription
    processPayment(plan, amount, false);
  };
  
  const processPayment = async (plan: "free" | "basic" | "premium", amount: number, isRenewal: boolean) => {
    setLoading(plan);
    try {
      // Use platformPiPayment which works on both web and non-web platforms
      await platformPiPayment(
        amount,
        `Trend Forge ${plan === "premium" ? "Premium" : "Basic"} Subscription`,
        { 
          subscription_type: plan, 
          username,
          isRenewal
        }
      );
      
      // Payment successful
      if (isRenewal) {
        renewSubscription(plan);
        Alert.alert(
          "Subscription Renewed",
          `Your ${plan === "premium" ? "Premium" : "Basic"} subscription has been renewed.`
        );
      } else {
        setSubscription(plan);
        Alert.alert(
          "Subscription Activated",
          `Your ${plan === "premium" ? "Premium" : "Basic"} subscription is now active.`
        );
      }
      
      setLoading(null);
      router.back();
      
    } catch (error) {
      console.error("Payment error:", error);
      setLoading(null);
      Alert.alert(
        "Payment Error",
        "There was an error processing your payment. Please try again."
      );
    }
  };

  const renderFeatureRow = (
    feature: string,
    freePlan: boolean | string,
    basicPlan: boolean | string,
    premiumPlan: boolean | string
  ) => {
    return (
      <View style={styles.featureRow}>
        <Text style={styles.featureText}>{feature}</Text>
        <View style={styles.featureValueContainer}>
          {typeof freePlan === "boolean" ? (
            freePlan ? (
              <Check size={18} color={colors.success} />
            ) : (
              <X size={18} color={colors.error} />
            )
          ) : (
            <Text style={styles.featureValueText}>{freePlan}</Text>
          )}
        </View>
        <View style={styles.featureValueContainer}>
          {typeof basicPlan === "boolean" ? (
            basicPlan ? (
              <Check size={18} color={colors.success} />
            ) : (
              <X size={18} color={colors.error} />
            )
          ) : (
            <Text style={styles.featureValueText}>{basicPlan}</Text>
          )}
        </View>
        <View style={styles.featureValueContainer}>
          {typeof premiumPlan === "boolean" ? (
            premiumPlan ? (
              <Check size={18} color={colors.success} />
            ) : (
              <X size={18} color={colors.error} />
            )
          ) : (
            <Text style={styles.featureValueText}>{premiumPlan}</Text>
          )}
        </View>
      </View>
    );
  };
  
  // Render subscription status banner if user has an active subscription
  const renderSubscriptionStatus = () => {
    if (subscriptionPlan === "free" || !subscriptionEndDate) return null;
    
    return (
      <View style={[
        styles.subscriptionStatus,
        isExpired ? styles.expiredStatus : styles.activeStatus
      ]}>
        <View style={styles.statusIconContainer}>
          {isExpired ? (
            <AlertTriangle size={24} color={colors.error} />
          ) : (
            <Check size={24} color={colors.success} />
          )}
        </View>
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusTitle}>
            {isExpired 
              ? "Your subscription has expired" 
              : `Your ${subscriptionPlan === "premium" ? "Premium" : "Basic"} subscription is active`
            }
          </Text>
          <Text style={styles.statusDescription}>
            {isExpired 
              ? "Renew your subscription to continue enjoying the benefits." 
              : `${daysRemaining} days remaining until renewal`
            }
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>Subscription Plans</Text>
        <Text style={styles.subtitle}>
          Choose the plan that works best for you
        </Text>
      </View>
      
      {renderSubscriptionStatus()}
      
      {Platform.OS === 'web' && !piSdkReady && (
        <View style={styles.piSdkErrorContainer}>
          <Text style={styles.piSdkErrorText}>
            {piSdkError || 'Pi SDK is not available. Please initialize it to subscribe.'}
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

      <View style={styles.plansContainer}>
        <View style={styles.planHeaderRow}>
          <View style={styles.planFeatureHeader} />
          <View style={styles.planHeader}>
            <Text style={styles.planHeaderText}>Free</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={styles.planHeaderText}>Basic</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={styles.planHeaderText}>Premium</Text>
          </View>
        </View>

        <View style={styles.planPriceRow}>
          <View style={styles.planFeatureHeader} />
          <View style={styles.planHeader}>
            <Text style={styles.planPriceText}>0π</Text>
            <Text style={styles.planPriceSubtext}>forever</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={styles.planPriceText}>6π</Text>
            <Text style={styles.planPriceSubtext}>per month</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={styles.planPriceText}>10π</Text>
            <Text style={styles.planPriceSubtext}>per month</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {renderFeatureRow("Article Limit", "3/day", "Unlimited", "Unlimited")}
          {renderFeatureRow("Premium Content", false, false, true)}
          {renderFeatureRow("Ad-Free Experience", false, true, true)}
          {renderFeatureRow("Bookmark Articles", true, true, true)}
          {renderFeatureRow("Comment on Articles", true, true, true)}
          {renderFeatureRow("Exclusive Newsletters", false, false, true)}
          {renderFeatureRow("Early Access to Features", false, false, true)}
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.planFeatureHeader} />
          <View style={styles.planButtonContainer}>
            <TouchableOpacity
              style={[
                styles.planButton,
                subscriptionPlan === "free" && subscriptionStatus === "active" && styles.currentPlanButton,
              ]}
              onPress={() => handleSubscribe("free", 0)}
              disabled={subscriptionPlan === "free" && subscriptionStatus === "active" || loading !== null}
            >
              {loading === "free" ? (
                <ActivityIndicator size="small" color={colors.card} />
              ) : (
                <Text
                  style={[
                    styles.planButtonText,
                    subscriptionPlan === "free" && subscriptionStatus === "active" && styles.currentPlanText,
                  ]}
                >
                  {subscriptionPlan === "free" && subscriptionStatus === "active" ? "Current" : "Select"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.planButtonContainer}>
            <TouchableOpacity
              style={[
                styles.planButton,
                subscriptionPlan === "basic" && subscriptionStatus === "active" && styles.currentPlanButton,
                subscriptionPlan === "basic" && isExpired && styles.renewButton,
                (Platform.OS === 'web' && !piSdkReady) && styles.disabledButton,
              ]}
              onPress={() => handleSubscribe("basic", 6)}
              disabled={
                (subscriptionPlan === "basic" && subscriptionStatus === "active" && !isExpired) || 
                loading !== null || 
                (Platform.OS === 'web' && !piSdkReady)
              }
            >
              {loading === "basic" ? (
                <ActivityIndicator size="small" color={colors.card} />
              ) : (
                <Text
                  style={[
                    styles.planButtonText,
                    subscriptionPlan === "basic" && subscriptionStatus === "active" && !isExpired && styles.currentPlanText,
                  ]}
                >
                  {subscriptionPlan === "basic" && subscriptionStatus === "active" && !isExpired 
                    ? "Current" 
                    : subscriptionPlan === "basic" && isExpired 
                      ? "Renew" 
                      : "Subscribe"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.planButtonContainer}>
            <TouchableOpacity
              style={[
                styles.planButton,
                styles.premiumButton,
                subscriptionPlan === "premium" && subscriptionStatus === "active" && styles.currentPlanButton,
                subscriptionPlan === "premium" && isExpired && styles.renewButton,
                (Platform.OS === 'web' && !piSdkReady) && styles.disabledButton,
              ]}
              onPress={() => handleSubscribe("premium", 10)}
              disabled={
                (subscriptionPlan === "premium" && subscriptionStatus === "active" && !isExpired) || 
                loading !== null || 
                (Platform.OS === 'web' && !piSdkReady)
              }
            >
              {loading === "premium" ? (
                <ActivityIndicator size="small" color={colors.card} />
              ) : (
                <Text
                  style={[
                    styles.planButtonText,
                    subscriptionPlan === "premium" && subscriptionStatus === "active" && !isExpired && styles.currentPlanText,
                  ]}
                >
                  {subscriptionPlan === "premium" && subscriptionStatus === "active" && !isExpired 
                    ? "Current" 
                    : subscriptionPlan === "premium" && isExpired 
                      ? "Renew" 
                      : "Subscribe"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.featuredPlansContainer}>
        <View style={styles.featuredPlan}>
          <View style={styles.featuredPlanHeader}>
            <Newspaper size={24} color={colors.text} />
            <Text style={styles.featuredPlanTitle}>Basic Plan</Text>
          </View>
          <Text style={styles.featuredPlanPrice}>6π per month</Text>
          <Text style={styles.featuredPlanDescription}>
            Perfect for regular readers who want an ad-free experience and unlimited access to basic articles.
          </Text>
          <View style={styles.featuredPlanFeatures}>
            <View style={styles.featuredPlanFeature}>
              <Check size={16} color={colors.success} />
              <Text style={styles.featuredPlanFeatureText}>Unlimited articles</Text>
            </View>
            <View style={styles.featuredPlanFeature}>
              <Check size={16} color={colors.success} />
              <Text style={styles.featuredPlanFeatureText}>Ad-free experience</Text>
            </View>
            <View style={styles.featuredPlanFeature}>
              <Check size={16} color={colors.success} />
              <Text style={styles.featuredPlanFeatureText}>Bookmark and comment</Text>
            </View>
            <View style={styles.featuredPlanFeature}>
              <X size={16} color={colors.error} />
              <Text style={styles.featuredPlanFeatureText}>No premium content</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.featuredPlanButton,
              subscriptionPlan === "basic" && subscriptionStatus === "active" && !isExpired && styles.currentPlanButton,
              subscriptionPlan === "basic" && isExpired && styles.renewButton,
              (Platform.OS === 'web' && !piSdkReady) && styles.disabledButton,
            ]}
            onPress={() => handleSubscribe("basic", 6)}
            disabled={
              (subscriptionPlan === "basic" && subscriptionStatus === "active" && !isExpired) || 
              loading !== null || 
              (Platform.OS === 'web' && !piSdkReady)
            }
          >
            {loading === "basic" ? (
              <ActivityIndicator size="small" color={colors.card} />
            ) : (
              <Text
                style={[
                  styles.featuredPlanButtonText,
                  subscriptionPlan === "basic" && subscriptionStatus === "active" && !isExpired && styles.currentPlanText,
                ]}
              >
                {subscriptionPlan === "basic" && subscriptionStatus === "active" && !isExpired 
                  ? "Current Plan" 
                  : subscriptionPlan === "basic" && isExpired 
                    ? "Renew Basic" 
                    : "Get Basic"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.featuredPlan, styles.premiumFeaturedPlan]}>
          <View style={styles.featuredPlanBadge}>
            <Text style={styles.featuredPlanBadgeText}>BEST VALUE</Text>
          </View>
          <View style={styles.featuredPlanHeader}>
            <Award size={24} color={colors.primary} />
            <Text style={[styles.featuredPlanTitle, styles.premiumFeaturedPlanTitle]}>Premium Plan</Text>
          </View>
          <Text style={[styles.featuredPlanPrice, styles.premiumFeaturedPlanPrice]}>10π per month</Text>
          <Text style={styles.featuredPlanDescription}>
            The complete experience with unlimited access to all content including premium articles.
          </Text>
          <View style={styles.featuredPlanFeatures}>
            <View style={styles.featuredPlanFeature}>
              <Check size={16} color={colors.success} />
              <Text style={styles.featuredPlanFeatureText}>Unlimited articles</Text>
            </View>
            <View style={styles.featuredPlanFeature}>
              <Check size={16} color={colors.success} />
              <Text style={styles.featuredPlanFeatureText}>Ad-free experience</Text>
            </View>
            <View style={styles.featuredPlanFeature}>
              <Check size={16} color={colors.success} />
              <Text style={styles.featuredPlanFeatureText}>Premium content access</Text>
            </View>
            <View style={styles.featuredPlanFeature}>
              <Check size={16} color={colors.success} />
              <Text style={styles.featuredPlanFeatureText}>Exclusive newsletters</Text>
            </View>
            <View style={styles.featuredPlanFeature}>
              <Check size={16} color={colors.success} />
              <Text style={styles.featuredPlanFeatureText}>Early access to features</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.featuredPlanButton,
              styles.premiumFeaturedPlanButton,
              subscriptionPlan === "premium" && subscriptionStatus === "active" && !isExpired && styles.currentPlanButton,
              subscriptionPlan === "premium" && isExpired && styles.renewButton,
              (Platform.OS === 'web' && !piSdkReady) && styles.disabledButton,
            ]}
            onPress={() => handleSubscribe("premium", 10)}
            disabled={
              (subscriptionPlan === "premium" && subscriptionStatus === "active" && !isExpired) || 
              loading !== null || 
              (Platform.OS === 'web' && !piSdkReady)
            }
          >
            {loading === "premium" ? (
              <ActivityIndicator size="small" color={colors.card} />
            ) : (
              <Text
                style={[
                  styles.featuredPlanButtonText,
                  subscriptionPlan === "premium" && subscriptionStatus === "active" && !isExpired && styles.currentPlanText,
                ]}
              >
                {subscriptionPlan === "premium" && subscriptionStatus === "active" && !isExpired 
                  ? "Current Plan" 
                  : subscriptionPlan === "premium" && isExpired 
                    ? "Renew Premium" 
                    : "Get Premium"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.faqContainer}>
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I cancel my subscription?</Text>
          <Text style={styles.faqAnswer}>
            You can cancel your subscription at any time from your profile settings. Your subscription will remain active until the end of your current billing period.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
          <Text style={styles.faqAnswer}>
            We currently accept Pi cryptocurrency as our payment method. Payments are processed securely through the Pi Network.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>What is premium content?</Text>
          <Text style={styles.faqAnswer}>
            Premium content includes in-depth analysis, exclusive interviews, special reports, and expert journalism that goes beyond our regular coverage.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.primary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
  subscriptionStatus: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  activeStatus: {
    backgroundColor: colors.success + "20", // 20% opacity
    borderWidth: 1,
    borderColor: colors.success,
  },
  expiredStatus: {
    backgroundColor: colors.error + "20", // 20% opacity
    borderWidth: 1,
    borderColor: colors.error,
  },
  statusIconContainer: {
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  plansContainer: {
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  planHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  planFeatureHeader: {
    flex: 1.5,
    padding: 12,
  },
  planHeader: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  planHeaderText: {
    ...typography.body,
    fontWeight: "600",
  },
  planPriceRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  planPriceText: {
    ...typography.h3,
    color: colors.primary,
  },
  planPriceSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  featuresContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureText: {
    flex: 1.5,
    padding: 12,
    ...typography.body,
  },
  featureValueContainer: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureValueText: {
    ...typography.body,
  },
  buttonRow: {
    flexDirection: "row",
    padding: 12,
  },
  planButtonContainer: {
    flex: 1,
    alignItems: "center",
  },
  planButton: {
    backgroundColor: colors.textSecondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  premiumButton: {
    backgroundColor: colors.primary,
  },
  currentPlanButton: {
    backgroundColor: colors.success,
  },
  renewButton: {
    backgroundColor: colors.error,
  },
  disabledButton: {
    backgroundColor: colors.inactive || '#cccccc',
  },
  planButtonText: {
    color: colors.card,
    fontWeight: "600",
  },
  currentPlanText: {
    color: colors.card,
  },
  featuredPlansContainer: {
    padding: 16,
  },
  featuredPlan: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  premiumFeaturedPlan: {
    borderColor: colors.primary,
    position: "relative",
  },
  featuredPlanBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredPlanBadgeText: {
    color: colors.card,
    fontSize: 10,
    fontWeight: "bold",
  },
  featuredPlanHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featuredPlanTitle: {
    ...typography.h3,
    marginLeft: 8,
  },
  premiumFeaturedPlanTitle: {
    color: colors.primary,
  },
  featuredPlanPrice: {
    ...typography.h2,
    marginBottom: 8,
  },
  premiumFeaturedPlanPrice: {
    color: colors.primary,
  },
  featuredPlanDescription: {
    ...typography.body,
    marginBottom: 16,
    color: colors.textSecondary,
  },
  featuredPlanFeatures: {
    marginBottom: 16,
  },
  featuredPlanFeature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featuredPlanFeatureText: {
    ...typography.body,
    marginLeft: 8,
  },
  featuredPlanButton: {
    backgroundColor: colors.textSecondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  premiumFeaturedPlanButton: {
    backgroundColor: colors.primary,
  },
  featuredPlanButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
  faqContainer: {
    padding: 16,
    marginBottom: 32,
  },
  faqTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqQuestion: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 8,
  },
  faqAnswer: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
