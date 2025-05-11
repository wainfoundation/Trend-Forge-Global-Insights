import React, { useState, useEffect, useRef } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/auth-store";
import AuthModal from "@/components/AuthModal";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { useRouter } from "expo-router";
import { 
  User, 
  LogOut, 
  Bell, 
  CreditCard, 
  HelpCircle, 
  Settings, 
  ChevronRight,
  Lock,
  BookOpen,
  Edit3,
  FileText,
  Users,
  BarChart2,
  Shield,
  Calendar,
  AlertTriangle,
  Cookie,
  Mail,
  Info,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Eye,
  History,
} from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    username, 
    isAuthenticated, 
    subscriptionPlan,
    subscriptionStatus,
    subscriptionEndDate,
    logout, 
    isAdmin, 
    isJournalist,
    walletAddress,
    cancelSubscription,
    checkSubscriptionExpiration
  } = useAuthStore();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Use a ref to track if we've already checked the subscription
  // to prevent infinite loops
  const hasCheckedSubscription = useRef(false);
  
  // Check subscription expiration only once when component mounts
  useEffect(() => {
    if (isAuthenticated && !hasCheckedSubscription.current) {
      checkSubscriptionExpiration();
      hasCheckedSubscription.current = true;
    }
  }, [isAuthenticated]);
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: () => logout(),
          style: "destructive",
        },
      ]
    );
  };
  
  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      `Are you sure you want to cancel your ${subscriptionPlan === "premium" ? "Premium" : "Basic"} subscription? You will lose access to ${subscriptionPlan === "premium" ? "premium content" : "ad-free reading"}.`,
      [
        {
          text: "Keep Subscription",
          style: "cancel",
        },
        {
          text: "Cancel Subscription",
          onPress: () => {
            cancelSubscription();
            Alert.alert(
              "Subscription Canceled",
              "Your subscription has been canceled. You have been downgraded to the Free plan."
            );
          },
          style: "destructive",
        },
      ]
    );
  };
  
  const formatSubscriptionDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return 0;
    
    const endDate = new Date(dateString);
    const today = new Date();
    
    // Set both dates to midnight for accurate day calculation
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const renderSubscriptionStatus = () => {
    if (subscriptionPlan === "free") {
      return (
        <View style={styles.subscriptionInfo}>
          <Text style={styles.subscriptionTitle}>Free Plan</Text>
          <Text style={styles.subscriptionDescription}>
            You are currently on the Free plan with limited access to 3 articles per day.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push("/subscription-plans")}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const daysRemaining = getDaysRemaining(subscriptionEndDate);
    const isExpired = subscriptionStatus === "expired" || daysRemaining <= 0;
    
    return (
      <View style={styles.subscriptionInfo}>
        <View style={styles.subscriptionHeader}>
          <Text style={styles.subscriptionTitle}>
            {subscriptionPlan === "premium" ? "Premium" : "Basic"} Plan
          </Text>
          <View style={[
            styles.statusBadge,
            isExpired ? styles.expiredBadge : styles.activeBadge
          ]}>
            <Text style={styles.statusBadgeText}>
              {isExpired ? "Expired" : "Active"}
            </Text>
          </View>
        </View>
        
        {isExpired ? (
          <View style={styles.expiredContainer}>
            <AlertTriangle size={20} color={colors.error} style={styles.expiredIcon} />
            <Text style={styles.expiredText}>
              Your subscription expired on {formatSubscriptionDate(subscriptionEndDate)}.
            </Text>
          </View>
        ) : (
          <View style={styles.dateContainer}>
            <Calendar size={16} color={colors.secondary} style={styles.dateIcon} />
            <Text style={styles.dateText}>
              Renews on {formatSubscriptionDate(subscriptionEndDate)}
              {daysRemaining > 0 && ` (${daysRemaining} days remaining)`}
            </Text>
          </View>
        )}
        
        <View style={styles.subscriptionButtons}>
          {isExpired ? (
            <TouchableOpacity
              style={styles.renewButton}
              onPress={() => router.push("/subscription-plans")}
            >
              <Text style={styles.renewButtonText}>Renew Subscription</Text>
            </TouchableOpacity>
          ) : (
            <>
              {subscriptionPlan === "basic" && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => router.push("/subscription-plans")}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };
  
  const renderProfileHeader = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.notLoggedInContainer}>
          <View style={styles.avatarPlaceholder}>
            <User size={40} color={colors.secondary} />
          </View>
          <Text style={[typography.h3, styles.welcomeText]}>
            Welcome to Trend Forge
          </Text>
          <Text style={[typography.body, styles.loginPrompt]}>
            Sign in with your Pi account to access personalized content and premium features.
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => setShowAuthModal(true)}
          >
            <Text style={styles.signInButtonText}>Sign In with Pi</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {username?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[typography.h3, styles.username]}>
              {username}
            </Text>
            <View style={styles.badgeContainer}>
              <View style={[
                styles.subscriptionBadge,
                { 
                  backgroundColor: 
                    subscriptionPlan === "premium" ? colors.primary : 
                    subscriptionPlan === "basic" ? "#0891b2" : 
                    colors.secondary 
                }
              ]}>
                <Text style={styles.subscriptionText}>
                  {subscriptionPlan === "premium" ? "Premium" : 
                   subscriptionPlan === "basic" ? "Basic" : "Free"}
                </Text>
                {subscriptionPlan !== "free" && <Lock size={12} color={colors.card} />}
              </View>
              
              {isAdmin && (
                <View style={[styles.roleBadge, { backgroundColor: "#4338ca" }]}>
                  <Text style={styles.roleBadgeText}>Admin</Text>
                </View>
              )}
              
              {isJournalist && (
                <View style={[styles.roleBadge, { backgroundColor: "#0891b2" }]}>
                  <Text style={styles.roleBadgeText}>Journalist</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {walletAddress && (
          <View style={styles.walletContainer}>
            <Text style={styles.walletLabel}>Pi Wallet</Text>
            <Text style={styles.walletAddress}>
              {walletAddress.substring(0, 10)}...{walletAddress.substring(walletAddress.length - 10)}
            </Text>
          </View>
        )}
        
        {/* Subscription Status */}
        {renderSubscriptionStatus()}
        
        {subscriptionPlan === "free" && <SubscriptionBanner />}
      </View>
    );
  };
  
  const renderMenuItem = (
    icon: React.ReactNode,
    title: string,
    onPress: () => void,
    showBadge: boolean = false
  ) => {
    return (
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemLeft}>
          {icon}
          <Text style={styles.menuItemText}>{title}</Text>
        </View>
        <View style={styles.menuItemRight}>
          {showBadge && (
            <View style={styles.menuBadge}>
              <Text style={styles.menuBadgeText}>New</Text>
            </View>
          )}
          <ChevronRight size={20} color={colors.secondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const openSocialMedia = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error("Failed to open URL:", err);
      Alert.alert("Error", "Could not open the link. Please try again later.");
    });
  };
  
  return (
    <ScrollView style={styles.container}>
      {renderProfileHeader()}
      
      {isAuthenticated && (
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          {renderMenuItem(
            <Bell size={24} color={colors.text} style={styles.menuIcon} />,
            "Notification Settings",
            () => router.push("/notification-settings"),
          )}
          {renderMenuItem(
            <CreditCard size={24} color={colors.text} style={styles.menuIcon} />,
            "Subscription",
            () => router.push("/subscription-plans")
          )}
          {renderMenuItem(
            <History size={24} color={colors.text} style={styles.menuIcon} />,
            "Reading History",
            () => router.push("/reading-history")
          )}
          {!isJournalist && !isAdmin && renderMenuItem(
            <Edit3 size={24} color={colors.text} style={styles.menuIcon} />,
            "Apply to be a Journalist",
            () => router.push("/journalist-program")
          )}
        </View>
      )}
      
      {isAuthenticated && isJournalist && (
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Journalist Tools</Text>
          {renderMenuItem(
            <FileText size={24} color={colors.text} style={styles.menuIcon} />,
            "My Articles",
            () => router.push("/my-articles")
          )}
          {renderMenuItem(
            <Edit3 size={24} color={colors.text} style={styles.menuIcon} />,
            "Write New Article",
            () => router.push("/write-article")
          )}
          {renderMenuItem(
            <BarChart2 size={24} color={colors.text} style={styles.menuIcon} />,
            "Performance Stats",
            () => router.push("/journalist-dashboard")
          )}
          {renderMenuItem(
            <CreditCard size={24} color={colors.text} style={styles.menuIcon} />,
            "Pi Earnings",
            () => router.push("/pi-earnings")
          )}
        </View>
      )}
      
      {isAuthenticated && isAdmin && (
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Admin Tools</Text>
          {renderMenuItem(
            <BarChart2 size={24} color={colors.text} style={styles.menuIcon} />,
            "Admin Dashboard",
            () => router.push("/admin")
          )}
          {renderMenuItem(
            <FileText size={24} color={colors.text} style={styles.menuIcon} />,
            "Content Management",
            () => router.push("/my-articles")
          )}
          {renderMenuItem(
            <Users size={24} color={colors.text} style={styles.menuIcon} />,
            "User Management",
            () => router.push("/user-management")
          )}
          {renderMenuItem(
            <Shield size={24} color={colors.text} style={styles.menuIcon} />,
            "Site Settings",
            () => router.push("/site-settings")
          )}
        </View>
      )}
      
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Support & Information</Text>
        {renderMenuItem(
          <HelpCircle size={24} color={colors.text} style={styles.menuIcon} />,
          "Help & FAQ",
          () => router.push("/help-faq")
        )}
        {renderMenuItem(
          <FileText size={24} color={colors.text} style={styles.menuIcon} />,
          "Privacy & Terms",
          () => router.push("/privacy-terms")
        )}
        {renderMenuItem(
          <Cookie size={24} color={colors.text} style={styles.menuIcon} />,
          "Cookie Policy",
          () => router.push("/cookie-policy")
        )}
        {renderMenuItem(
          <Mail size={24} color={colors.text} style={styles.menuIcon} />,
          "Contact Us",
          () => router.push("/contact-us")
        )}
        {renderMenuItem(
          <Info size={24} color={colors.text} style={styles.menuIcon} />,
          "About Us",
          () => router.push("/about-us")
        )}
        {renderMenuItem(
          <Settings size={24} color={colors.text} style={styles.menuIcon} />,
          "Settings",
          () => router.push("/settings")
        )}
      </View>
      
      {isAuthenticated && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.socialMediaSection}>
        <Text style={styles.socialMediaTitle}>Follow Us</Text>
        <View style={styles.socialMediaIcons}>
          <TouchableOpacity 
            style={styles.socialIcon} 
            onPress={() => openSocialMedia("https://facebook.com/trendforge")}
          >
            <Facebook size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialIcon} 
            onPress={() => openSocialMedia("https://twitter.com/trendforge")}
          >
            <Twitter size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialIcon} 
            onPress={() => openSocialMedia("https://instagram.com/trendforge")}
          >
            <Instagram size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialIcon} 
            onPress={() => openSocialMedia("https://linkedin.com/company/trendforge")}
          >
            <Linkedin size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialIcon} 
            onPress={() => openSocialMedia("https://youtube.com/trendforge")}
          >
            <Youtube size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Trend Forge v1.0.0</Text>
        <Text style={styles.footerText}>Powered by Pi Network</Text>
        <TouchableOpacity onPress={() => openSocialMedia("https://trendforge.com")}>
          <Text style={styles.websiteLink}>www.trendforge.com</Text>
        </TouchableOpacity>
      </View>
      
      <AuthModal 
        visible={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notLoggedInContainer: {
    backgroundColor: colors.card,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeText: {
    marginBottom: 8,
    textAlign: "center",
  },
  loginPrompt: {
    textAlign: "center",
    color: colors.secondary,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  signInButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
  profileHeader: {
    backgroundColor: colors.card,
    padding: 24,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: colors.card,
    fontSize: 32,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subscriptionBadge: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
    gap: 4,
  },
  subscriptionText: {
    color: colors.card,
    fontWeight: "500",
    fontSize: 12,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleBadgeText: {
    color: colors.card,
    fontWeight: "500",
    fontSize: 12,
  },
  walletContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  walletLabel: {
    ...typography.bodySmall,
    color: colors.secondary,
    marginBottom: 4,
  },
  walletAddress: {
    ...typography.body,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  subscriptionInfo: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  subscriptionTitle: {
    ...typography.body,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: colors.success,
  },
  expiredBadge: {
    backgroundColor: colors.error,
  },
  statusBadgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: "500",
  },
  subscriptionDescription: {
    ...typography.bodySmall,
    color: colors.secondary,
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    ...typography.bodySmall,
    color: colors.secondary,
  },
  expiredContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error + "20", // 20% opacity
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  expiredIcon: {
    marginRight: 8,
  },
  expiredText: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },
  subscriptionButtons: {
    gap: 8,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: colors.card,
    fontWeight: "600",
  },
  renewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  renewButtonText: {
    color: colors.card,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: colors.background,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error,
  },
  cancelButtonText: {
    color: colors.error,
    fontWeight: "500",
  },
  menuSection: {
    backgroundColor: colors.card,
    marginBottom: 16,
    paddingVertical: 8,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  menuBadgeText: {
    color: colors.card,
    fontSize: 10,
    fontWeight: "500",
  },
  socialMediaSection: {
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  socialMediaTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 16,
  },
  socialMediaIcons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error + "30", // 30% opacity
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: colors.error,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    marginBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 4,
  },
  websiteLink: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    textDecorationLine: "underline",
  },
});
