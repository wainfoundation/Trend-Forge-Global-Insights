import React from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  ScrollView 
} from "react-native";
import { useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/auth-store";
import { Lock, AlertTriangle, ArrowLeft } from "lucide-react-native";

export default function UnauthorizedScreen() {
  const router = useRouter();
  const { isAuthenticated, subscriptionPlan } = useAuthStore();
  
  const handleGoBack = () => {
    router.back();
  };
  
  const handleGoHome = () => {
    router.replace("/");
  };
  
  const handleUpgrade = () => {
    router.push("/subscription-plans");
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Lock size={64} color={colors.error} />
        </View>
        
        <Text style={[typography.h1, styles.title]}>Access Denied</Text>
        
        <Text style={[typography.body, styles.description]}>
          {!isAuthenticated
            ? "You need to sign in to access this content."
            : subscriptionPlan === "free"
            ? "This content is only available to paid subscribers."
            : "You don't have permission to access this page."}
        </Text>
        
        <View style={styles.alertContainer}>
          <AlertTriangle size={20} color={colors.error} style={styles.alertIcon} />
          <Text style={styles.alertText}>
            {!isAuthenticated
              ? "Please sign in with your Pi account to continue."
              : subscriptionPlan === "free"
              ? "Upgrade your subscription to access premium content."
              : "If you believe this is an error, please contact support."}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft size={20} color={colors.text} />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
          
          {subscriptionPlan === "free" && (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
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
  content: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 500,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.error + "20", // 20% opacity
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
    color: colors.error,
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    color: colors.textSecondary,
  },
  alertContainer: {
    flexDirection: "row",
    backgroundColor: colors.error + "10", // 10% opacity
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.error + "30", // 30% opacity
  },
  alertIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  alertText: {
    flex: 1,
    ...typography.body,
    color: colors.error,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    ...typography.body,
    fontWeight: "600",
    marginLeft: 8,
  },
  upgradeButton: {
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  upgradeButtonText: {
    ...typography.body,
    fontWeight: "600",
    color: colors.card,
  },
  homeButton: {
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  homeButtonText: {
    ...typography.body,
    fontWeight: "600",
  },
});
