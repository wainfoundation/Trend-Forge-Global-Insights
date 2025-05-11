import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Stack } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/auth-store";
import {
  Calendar,
  ChevronDown,
  Download,
  CheckCircle,
  Clock,
  Search,
  Filter,
} from "lucide-react-native";

// Mock payment history data
const paymentHistory = [
  {
    id: "pmt1",
    month: "June 2023",
    amount: 120,
    status: "pending",
    date: "June 30, 2023",
    breakdown: {
      basicArticles: 45,
      premiumArticles: 60,
      performanceBonus: 15,
    },
    articles: 13,
  },
  {
    id: "pmt2",
    month: "May 2023",
    amount: 105,
    status: "completed",
    date: "May 31, 2023",
    transactionId: "pi-tx-123456",
    breakdown: {
      basicArticles: 40,
      premiumArticles: 50,
      performanceBonus: 15,
    },
    articles: 11,
  },
  {
    id: "pmt3",
    month: "April 2023",
    amount: 98,
    status: "completed",
    date: "April 30, 2023",
    transactionId: "pi-tx-123457",
    breakdown: {
      basicArticles: 38,
      premiumArticles: 45,
      performanceBonus: 15,
    },
    articles: 10,
  },
  {
    id: "pmt4",
    month: "March 2023",
    amount: 112,
    status: "completed",
    date: "March 31, 2023",
    transactionId: "pi-tx-123458",
    breakdown: {
      basicArticles: 42,
      premiumArticles: 55,
      performanceBonus: 15,
    },
    articles: 12,
  },
  {
    id: "pmt5",
    month: "February 2023",
    amount: 87,
    status: "completed",
    date: "February 28, 2023",
    transactionId: "pi-tx-123459",
    breakdown: {
      basicArticles: 35,
      premiumArticles: 40,
      performanceBonus: 12,
    },
    articles: 9,
  },
  {
    id: "pmt6",
    month: "January 2023",
    amount: 95,
    status: "completed",
    date: "January 31, 2023",
    transactionId: "pi-tx-123460",
    breakdown: {
      basicArticles: 40,
      premiumArticles: 45,
      performanceBonus: 10,
    },
    articles: 10,
  },
];

export default function PaymentHistoryScreen() {
  const { isJournalist, isAdmin, walletAddress } = useAuthStore();
  const [selectedYear, setSelectedYear] = useState("2023");
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  // Filter payments based on year and status
  const filteredPayments = paymentHistory.filter((payment) => {
    const matchesYear = payment.month.includes(selectedYear);
    const matchesStatus = selectedStatus === null || payment.status === selectedStatus;
    return matchesYear && matchesStatus;
  });

  const togglePaymentDetails = (paymentId: string) => {
    if (expandedPayment === paymentId) {
      setExpandedPayment(null);
    } else {
      setExpandedPayment(paymentId);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: "Payment History" }} />

      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>Payment History</Text>
        <Text style={styles.subtitle}>
          View your complete payment history
        </Text>
      </View>

      {/* Wallet Status */}
      {isJournalist && (
        <View style={styles.walletCard}>
          <Text style={styles.walletTitle}>Pi Wallet Status</Text>
          {walletAddress ? (
            <View style={styles.walletConnected}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.walletConnectedText}>
                Wallet connected: {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 4)}
              </Text>
            </View>
          ) : (
            <View style={styles.walletWarning}>
              <Clock size={16} color="#f59e0b" />
              <Text style={styles.walletWarningText}>
                No wallet connected. Please connect your Pi wallet in the Earnings page to receive payments.
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={styles.yearSelector}
          onPress={() => setShowYearPicker(!showYearPicker)}
        >
          <Calendar size={16} color={colors.primary} />
          <Text style={styles.yearSelectorText}>{selectedYear}</Text>
          <ChevronDown
            size={16}
            color={colors.primary}
            style={{
              transform: [{ rotate: showYearPicker ? "180deg" : "0deg" }],
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statusSelector}
          onPress={() => setShowStatusFilter(!showStatusFilter)}
        >
          <Filter size={16} color={colors.primary} />
          <Text style={styles.statusSelectorText}>
            {selectedStatus ? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1) : "All"}
          </Text>
          <ChevronDown
            size={16}
            color={colors.primary}
            style={{
              transform: [{ rotate: showStatusFilter ? "180deg" : "0deg" }],
            }}
          />
        </TouchableOpacity>
      </View>

      {showYearPicker && (
        <View style={styles.yearPickerContainer}>
          {["2023", "2022", "2021"].map((year) => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearPickerItem,
                selectedYear === year && styles.selectedYearItem,
              ]}
              onPress={() => {
                setSelectedYear(year);
                setShowYearPicker(false);
              }}
            >
              <Text
                style={[
                  styles.yearPickerText,
                  selectedYear === year && styles.selectedYearText,
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showStatusFilter && (
        <View style={styles.statusFilterContainer}>
          <TouchableOpacity
            style={[
              styles.statusFilterItem,
              selectedStatus === null && styles.selectedStatusItem,
            ]}
            onPress={() => {
              setSelectedStatus(null);
              setShowStatusFilter(false);
            }}
          >
            <Text
              style={[
                styles.statusFilterText,
                selectedStatus === null && styles.selectedStatusText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {["completed", "pending"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilterItem,
                selectedStatus === status && styles.selectedStatusItem,
              ]}
              onPress={() => {
                setSelectedStatus(status);
                setShowStatusFilter(false);
              }}
            >
              {status === "completed" ? (
                <CheckCircle size={16} color="#10b981" />
              ) : (
                <Clock size={16} color="#f59e0b" />
              )}
              <Text
                style={[
                  styles.statusFilterText,
                  selectedStatus === status && styles.selectedStatusText,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary for {selectedYear}</Text>
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Earned</Text>
            <Text style={styles.summaryValue}>
              {filteredPayments
                .filter(p => p.status === "completed")
                .reduce((sum, payment) => sum + payment.amount, 0)} π
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Payments</Text>
            <Text style={styles.summaryValue}>
              {filteredPayments.filter(p => p.status === "completed").length}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Articles</Text>
            <Text style={styles.summaryValue}>
              {filteredPayments.reduce((sum, payment) => sum + payment.articles, 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryPendingValue}>
              {filteredPayments
                .filter(p => p.status === "pending")
                .reduce((sum, payment) => sum + payment.amount, 0)} π
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.paymentsContainer}>
        <View style={styles.paymentsHeader}>
          <Text style={styles.paymentsTitle}>Payments</Text>
          <TouchableOpacity style={styles.exportButton}>
            <Download size={16} color={colors.primary} />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </View>

        {filteredPayments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payments found</Text>
            <Text style={styles.emptySubtext}>
              Try changing your filters or check back later
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredPayments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.paymentCard}>
                <TouchableOpacity
                  style={styles.paymentHeader}
                  onPress={() => togglePaymentDetails(item.id)}
                >
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentMonth}>{item.month}</Text>
                    <Text style={styles.paymentDate}>{item.date}</Text>
                  </View>
                  <View style={styles.paymentAmountContainer}>
                    <Text style={styles.paymentAmount}>{item.amount} π</Text>
                    <View
                      style={[
                        styles.paymentStatusBadge,
                        item.status === "completed"
                          ? styles.completedBadge
                          : styles.pendingBadge,
                      ]}
                    >
                      {item.status === "completed" ? (
                        <CheckCircle size={12} color="#10b981" />
                      ) : (
                        <Clock size={12} color="#f59e0b" />
                      )}
                      <Text
                        style={[
                          styles.paymentStatusText,
                          item.status === "completed"
                            ? styles.completedText
                            : styles.pendingText,
                        ]}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <ChevronDown
                    size={16}
                    color={colors.textSecondary}
                    style={{
                      transform: [
                        { rotate: expandedPayment === item.id ? "180deg" : "0deg" },
                      ],
                    }}
                  />
                </TouchableOpacity>

                {expandedPayment === item.id && (
                  <View style={styles.paymentDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Articles</Text>
                      <Text style={styles.detailValue}>{item.articles}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Basic Articles</Text>
                      <Text style={styles.detailValue}>{item.breakdown.basicArticles} π</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Premium Articles</Text>
                      <Text style={styles.detailValue}>{item.breakdown.premiumArticles} π</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Performance Bonus</Text>
                      <Text style={styles.detailValue}>{item.breakdown.performanceBonus} π</Text>
                    </View>
                    {item.transactionId && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Transaction ID</Text>
                        <Text style={styles.detailValue}>{item.transactionId}</Text>
                      </View>
                    )}
                    {item.status === "completed" && (
                      <TouchableOpacity style={styles.receiptButton}>
                        <Download size={16} color={colors.primary} />
                        <Text style={styles.receiptButtonText}>Download Receipt</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
            scrollEnabled={false}
          />
        )}
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
  walletCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  walletTitle: {
    ...typography.h3,
    marginBottom: 12,
  },
  walletConnected: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b98110", // green with 10% opacity
    padding: 12,
    borderRadius: 8,
  },
  walletConnectedText: {
    ...typography.body,
    color: "#10b981", // green
    marginLeft: 8,
  },
  walletWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b10", // amber with 10% opacity
    padding: 12,
    borderRadius: 8,
  },
  walletWarningText: {
    ...typography.body,
    color: "#f59e0b", // amber
    marginLeft: 8,
    flex: 1,
  },
  filtersContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  yearSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearSelectorText: {
    ...typography.body,
    flex: 1,
    marginLeft: 8,
  },
  statusSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusSelectorText: {
    ...typography.body,
    flex: 1,
    marginLeft: 8,
  },
  yearPickerContainer: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 16,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
  yearPickerItem: {
    padding: 12,
    borderRadius: 4,
  },
  selectedYearItem: {
    backgroundColor: colors.primary + "20", // 20% opacity
  },
  yearPickerText: {
    ...typography.body,
  },
  selectedYearText: {
    color: colors.primary,
    fontWeight: "500",
  },
  statusFilterContainer: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 16,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
  statusFilterItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 4,
  },
  selectedStatusItem: {
    backgroundColor: colors.primary + "20", // 20% opacity
  },
  statusFilterText: {
    ...typography.body,
    marginLeft: 8,
  },
  selectedStatusText: {
    color: colors.primary,
    fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  paymentsContainer: {
    margin: 16,
    marginBottom: 32,
  },
  paymentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  paymentsTitle: {
    ...typography.h3,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  exportButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  emptyText: {
    ...typography.body,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
  paymentCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMonth: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 4,
  },
  paymentDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  paymentAmountContainer: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  paymentAmount: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 4,
  },
  paymentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedBadge: {
    backgroundColor: "#10b98120", // green with 20% opacity
  },
  pendingBadge: {
    backgroundColor: "#f59e0b20", // amber with 20% opacity
  },
  paymentStatusText: {
    ...typography.caption,
    marginLeft: 4,
  },
  completedText: {
    color: "#10b981", // green
  },
  pendingText: {
    color: "#f59e0b", // amber
  },
  paymentDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.body,
  },
  detailValue: {
    ...typography.body,
    fontWeight: "500",
  },
  receiptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  receiptButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: 8,
  },
});
