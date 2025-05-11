import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/auth-store";
import {
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronRight,
  BarChart2,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet,
  Copy,
  ExternalLink,
  X, // Added missing X icon
} from "lucide-react-native";
import PerformanceChart from "@/components/PerformanceChart";
import { Payment } from "@/types/payment";

// Mock earnings data
const earningsData = {
  currentMonth: {
    total: 120,
    pending: 15,
    breakdown: {
      basicArticles: 45,
      premiumArticles: 60,
      performanceBonus: 15,
    },
    articles: {
      basic: 9,
      premium: 4,
    },
  },
  history: [
    {
      month: "May 2023",
      amount: 105,
      status: "completed",
      date: "May 31, 2023",
    },
    {
      month: "April 2023",
      amount: 98,
      status: "completed",
      date: "April 30, 2023",
    },
    {
      month: "March 2023",
      amount: 112,
      status: "completed",
      date: "March 31, 2023",
    },
    {
      month: "February 2023",
      amount: 87,
      status: "completed",
      date: "February 28, 2023",
    },
    {
      month: "January 2023",
      amount: 95,
      status: "completed",
      date: "January 31, 2023",
    },
  ],
  monthlyTrend: [
    { month: "Jan", amount: 95 },
    { month: "Feb", amount: 87 },
    { month: "Mar", amount: 112 },
    { month: "Apr", amount: 98 },
    { month: "May", amount: 105 },
    { month: "Jun", amount: 120 },
  ],
  pendingPayments: [
    {
      id: "pmt1",
      amount: 15,
      description: "Premium article: Pi Network security analysis",
      status: "pending",
      date: "June 25, 2023",
    },
  ],
};

export default function EarningsScreen() {
  const router = useRouter();
  const { isJournalist, isAdmin, walletAddress, setWalletAddress } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState("June 2023");
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<{id: string}[]>([]);
  const [withdrawnPayments, setWithdrawnPayments] = useState<Payment[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState(walletAddress || "");
  const [walletConnected, setWalletConnected] = useState(!!walletAddress);

  // Initialize state with mock data
  React.useEffect(() => {
    setPendingPayments(earningsData.pendingPayments as Payment[]);
  }, []);

  // Check if user is journalist or admin
  if (!isJournalist && !isAdmin) {
    router.replace("/unauthorized");
    return null;
  }

  const handleWithdraw = () => {
    if (!walletAddress) {
      Alert.alert(
        "Wallet Required",
        "Please connect your Pi wallet to withdraw funds.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Connect Wallet", onPress: () => setShowWalletModal(true) }
        ]
      );
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Withdrawal Initiated",
        `Your withdrawal of ${earningsData.currentMonth.total - earningsData.currentMonth.pending} π has been initiated. Funds will be transferred to your wallet within 24 hours.`,
        [{ text: "OK" }]
      );
    }, 1500);
  };

  const handleConnectWallet = () => {
    if (!newWalletAddress.trim()) {
      Alert.alert("Error", "Please enter a valid wallet address");
      return;
    }

    setIsLoading(true);
    // Simulate wallet connection
    setTimeout(() => {
      setWalletAddress(newWalletAddress.trim());
      setWalletConnected(true);
      setIsLoading(false);
      setShowWalletModal(false);
      Alert.alert(
        "Wallet Connected",
        "Your Pi wallet has been successfully connected for withdrawals.",
        [{ text: "OK" }]
      );
    }, 1000);
  };

  const copyWalletAddress = () => {
    if (walletAddress) {
      // In a real app, you would use Clipboard.setString(walletAddress)
      Alert.alert("Copied", "Wallet address copied to clipboard");
    }
  };

  const chartData = earningsData.monthlyTrend.map(item => ({
    label: item.month,
    value: item.amount,
    color: colors.primary,
  }));

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: "Pi Earnings" }} />

      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>Pi Earnings</Text>
        <Text style={styles.subtitle}>
          Track your earnings and payment history
        </Text>
      </View>

      {/* Wallet Connection Status */}
      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <Text style={styles.walletTitle}>Pi Wallet</Text>
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={() => setShowWalletModal(true)}
          >
            <Text style={styles.connectButtonText}>
              {walletConnected ? "Change Wallet" : "Connect Wallet"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {walletConnected ? (
          <View style={styles.walletInfo}>
            <View style={styles.walletAddressContainer}>
              <Text style={styles.walletAddressLabel}>Connected Wallet:</Text>
              <View style={styles.walletAddressRow}>
                <Text style={styles.walletAddress} numberOfLines={1}>
                  {walletAddress}
                </Text>
                <TouchableOpacity onPress={copyWalletAddress} style={styles.copyButton}>
                  <Copy size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.walletStatus}>
              <CheckCircle size={14} color="#10b981" /> Ready for withdrawals
            </Text>
          </View>
        ) : (
          <View style={styles.walletWarning}>
            <AlertCircle size={20} color="#f59e0b" />
            <Text style={styles.walletWarningText}>
              Connect your Pi wallet to withdraw your earnings
            </Text>
          </View>
        )}
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => setShowMonthPicker(!showMonthPicker)}
        >
          <Calendar size={20} color={colors.primary} />
          <Text style={styles.monthButtonText}>{selectedMonth}</Text>
          <ChevronDown
            size={16}
            color={colors.primary}
            style={{
              transform: [{ rotate: showMonthPicker ? "180deg" : "0deg" }],
            }}
          />
        </TouchableOpacity>
        
        {showMonthPicker && (
          <View style={styles.monthPickerContainer}>
            {["June 2023", "May 2023", "April 2023", "March 2023", "February 2023", "January 2023"].map((month) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthPickerItem,
                  selectedMonth === month && styles.selectedMonthItem,
                ]}
                onPress={() => {
                  setSelectedMonth(month);
                  setShowMonthPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.monthPickerText,
                    selectedMonth === month && styles.selectedMonthText,
                  ]}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Monthly Summary</Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Download size={16} color={colors.primary} />
            <Text style={styles.downloadButtonText}>Export</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Earnings</Text>
            <Text style={styles.summaryValue}>{earningsData.currentMonth.total} π</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryPendingValue}>{earningsData.currentMonth.pending} π</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Articles Written</Text>
            <Text style={styles.summaryValue}>
              {earningsData.currentMonth.articles.basic + earningsData.currentMonth.articles.premium}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Premium Articles</Text>
            <Text style={styles.summaryValue}>{earningsData.currentMonth.articles.premium}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            !walletConnected && styles.withdrawButtonDisabled
          ]}
          onPress={handleWithdraw}
          disabled={isLoading || !walletConnected}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.card} />
          ) : (
            <>
              <DollarSign size={16} color={colors.card} />
              <Text style={styles.withdrawButtonText}>
                Withdraw {earningsData.currentMonth.total - earningsData.currentMonth.pending} π
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        {!walletConnected && (
          <Text style={styles.withdrawalNote}>
            Connect your Pi wallet to enable withdrawals
          </Text>
        )}
      </View>

      <View style={styles.breakdownCard}>
        <Text style={styles.cardTitle}>Earnings Breakdown</Text>
        
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Basic Articles</Text>
          <Text style={styles.breakdownValue}>{earningsData.currentMonth.breakdown.basicArticles} π</Text>
        </View>
        
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Premium Articles</Text>
          <Text style={styles.breakdownValue}>{earningsData.currentMonth.breakdown.premiumArticles} π</Text>
        </View>
        
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Performance Bonus</Text>
          <Text style={styles.breakdownValue}>{earningsData.currentMonth.breakdown.performanceBonus} π</Text>
        </View>
        
        <View style={styles.breakdownTotal}>
          <Text style={styles.breakdownTotalLabel}>Total</Text>
          <Text style={styles.breakdownTotalValue}>{earningsData.currentMonth.total} π</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.cardTitle}>Monthly Earnings Trend</Text>
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>Details</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <PerformanceChart data={chartData} />
      </View>

      <View style={styles.pendingPaymentsCard}>
        <Text style={styles.cardTitle}>Pending Payments</Text>
        
        {pendingPayments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending payments</Text>
          </View>
        ) : (
          pendingPayments.map((payment) => (
            <View key={payment.id} style={styles.paymentItem}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentDescription}>{payment.description}</Text>
                <Text style={styles.paymentDate}>{payment.date}</Text>
              </View>
              <View style={styles.paymentAmountContainer}>
                <Text style={styles.paymentAmount}>{payment.amount} π</Text>
                <View style={styles.paymentStatusBadge}>
                  <Clock size={12} color="#f59e0b" />
                  <Text style={styles.paymentStatusText}>Pending</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.paymentHistoryCard}>
        <View style={styles.paymentHistoryHeader}>
          <Text style={styles.cardTitle}>Payment History</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push("/payment-history")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {earningsData.history.slice(0, 3).map((payment, index) => (
          <View 
            key={index} 
            style={[
              styles.historyItem,
              index < earningsData.history.slice(0, 3).length - 1 && styles.historyItemBorder
            ]}
          >
            <View style={styles.historyInfo}>
              <Text style={styles.historyMonth}>{payment.month}</Text>
              <Text style={styles.historyDate}>{payment.date}</Text>
            </View>
            <View style={styles.historyAmountContainer}>
              <Text style={styles.historyAmount}>{payment.amount} π</Text>
              <View style={styles.historyStatusBadge}>
                <CheckCircle size={12} color="#10b981" />
                <Text style={styles.historyStatusText}>Completed</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.earningRatesCard}>
        <Text style={styles.cardTitle}>Earning Rates</Text>
        
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>Basic Article</Text>
          <Text style={styles.rateValue}>5 π</Text>
        </View>
        
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>Premium Article</Text>
          <Text style={styles.rateValue}>15 π</Text>
        </View>
        
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>Performance Bonus (per month)</Text>
          <Text style={styles.rateValue}>Up to 20 π</Text>
        </View>
        
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>Referral Bonus</Text>
          <Text style={styles.rateValue}>2 π per journalist</Text>
        </View>
      </View>

      {/* Wallet Connection Modal */}
      <Modal
        visible={showWalletModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect Pi Wallet</Text>
              <TouchableOpacity 
                onPress={() => setShowWalletModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Enter your Pi wallet address to receive payments. Make sure to double-check your address to avoid losing funds.
            </Text>
            
            <View style={styles.walletInputContainer}>
              <Wallet size={20} color={colors.textSecondary} style={styles.walletInputIcon} />
              <TextInput
                style={styles.walletInput}
                placeholder="Pi Wallet Address"
                placeholderTextColor={colors.textSecondary}
                value={newWalletAddress}
                onChangeText={setNewWalletAddress}
                autoCapitalize="none"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.openWalletButton}
              onPress={() => {
                // In a real app, this would open the Pi Browser or Pi Wallet app
                Alert.alert("Info", "This would open the Pi Wallet app in a real implementation");
              }}
            >
              <ExternalLink size={16} color={colors.primary} />
              <Text style={styles.openWalletButtonText}>Open Pi Wallet App</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.connectWalletButton}
              onPress={handleConnectWallet}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.card} />
              ) : (
                <Text style={styles.connectWalletButtonText}>Connect Wallet</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.walletDisclaimer}>
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </View>
      </Modal>
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
  walletCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  walletTitle: {
    ...typography.h3,
  },
  connectButton: {
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  connectButtonText: {
    ...typography.caption,
    color: colors.primary,
  },
  walletInfo: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  walletAddressContainer: {
    marginBottom: 8,
  },
  walletAddressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  walletAddressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletAddress: {
    ...typography.body,
    flex: 1,
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  walletStatus: {
    ...typography.caption,
    color: "#10b981",
    flexDirection: "row",
    alignItems: "center",
  },
  walletWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b20",
    padding: 12,
    borderRadius: 8,
  },
  walletWarningText: {
    ...typography.bodySmall,
    color: "#f59e0b",
    marginLeft: 8,
    flex: 1,
  },
  monthSelector: {
    padding: 16,
    zIndex: 10,
  },
  monthButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthButtonText: {
    ...typography.body,
    flex: 1,
    marginLeft: 8,
  },
  monthPickerContainer: {
    position: "absolute",
    top: 64,
    left: 16,
    right: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthPickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedMonthItem: {
    backgroundColor: colors.primary + "20", // 20% opacity
  },
  monthPickerText: {
    ...typography.body,
  },
  selectedMonthText: {
    color: colors.primary,
    fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: colors.card,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    ...typography.h3,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  downloadButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
  },
  summaryContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  summaryItem: {
    width: "50%",
    marginBottom: 16,
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    ...typography.h3,
  },
  summaryPendingValue: {
    ...typography.h3,
    color: "#f59e0b", // amber
  },
  withdrawButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  withdrawButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  withdrawButtonText: {
    ...typography.body,
    color: colors.card,
    fontWeight: "500",
    marginLeft: 8,
  },
  withdrawalNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  breakdownCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownLabel: {
    ...typography.body,
  },
  breakdownValue: {
    ...typography.body,
    fontWeight: "500",
  },
  breakdownTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  breakdownTotalLabel: {
    ...typography.body,
    fontWeight: "500",
  },
  breakdownTotalValue: {
    ...typography.h3,
    color: colors.primary,
  },
  chartCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailsText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginRight: 4,
  },
  pendingPaymentsCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 8,
  },
  paymentDescription: {
    ...typography.body,
    marginBottom: 4,
  },
  paymentDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  paymentAmountContainer: {
    alignItems: "flex-end",
  },
  paymentAmount: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 4,
  },
  paymentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b20", // amber with 20% opacity
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentStatusText: {
    ...typography.caption,
    color: "#f59e0b", // amber
    marginLeft: 4,
  },
  paymentHistoryCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginRight: 4,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyInfo: {
    flex: 1,
    marginRight: 8,
  },
  historyMonth: {
    ...typography.body,
    marginBottom: 4,
  },
  historyDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyAmountContainer: {
    alignItems: "flex-end",
  },
  historyAmount: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 4,
  },
  historyStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b98120", // green with 20% opacity
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyStatusText: {
    ...typography.caption,
    color: "#10b981", // green
    marginLeft: 4,
  },
  earningRatesCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32,
  },
  rateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rateLabel: {
    ...typography.body,
  },
  rateValue: {
    ...typography.body,
    fontWeight: "500",
    color: colors.primary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    width: "85%",
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    ...typography.h3,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDescription: {
    ...typography.body,
    marginBottom: 16,
    color: colors.textSecondary,
  },
  walletInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  walletInputIcon: {
    marginRight: 12,
  },
  walletInput: {
    flex: 1,
    height: "100%",
    color: colors.text,
  },
  openWalletButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  openWalletButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 8,
  },
  connectWalletButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  connectWalletButtonText: {
    ...typography.body,
    color: colors.card,
    fontWeight: "500",
  },
  walletDisclaimer: {
    ...typography.caption,
    textAlign: "center",
    color: colors.textSecondary,
  },
});
