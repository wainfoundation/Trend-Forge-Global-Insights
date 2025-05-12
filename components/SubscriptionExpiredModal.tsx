import React from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity 
} from "react-native";
import { useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { X, AlertTriangle } from "lucide-react-native";

interface SubscriptionExpiredModalProps {
  visible: boolean;
  onClose: () => void;
  plan: "basic" | "premium";
}

export default function SubscriptionExpiredModal({ 
  visible, 
  onClose, 
  plan 
}: SubscriptionExpiredModalProps) {
  const router = useRouter();
  
  const handleRenewSubscription = () => {
    router.push("/subscription-plans");
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[typography.h3, styles.title]}>Subscription Expired</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.iconContainer}>
            <AlertTriangle size={40} color={colors.error} />
          </View>
          
          <Text style={styles.description}>
            Your {plan === "premium" ? "Premium" : "Basic"} subscription has expired. Renew now to continue enjoying {plan === "premium" ? "premium content and ad-free reading" : "ad-free reading"}.
          </Text>
          
          <TouchableOpacity
            style={styles.renewButton}
            onPress={handleRenewSubscription}
          >
            <Text style={styles.renewButtonText}>
              Renew Subscription
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.downgradeButton}
            onPress={onClose}
          >
            <Text style={styles.downgradeButtonText}>
              Continue with Free Plan
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    width: "85%",
    padding: 24,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  title: {
    flex: 1,
    color: colors.error,
  },
  closeButton: {
    padding: 4,
  },
  iconContainer: {
    backgroundColor: colors.error + "20", // 20% opacity
    padding: 16,
    borderRadius: 40,
    marginBottom: 16,
  },
  description: {
    ...typography.body,
    textAlign: "center",
    marginBottom: 24,
  },
  renewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  renewButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
  downgradeButton: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  downgradeButtonText: {
    color: colors.textSecondary,
    fontWeight: "500",
    fontSize: 16,
  },
});
