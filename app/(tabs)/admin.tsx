import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import {
  BarChart2,
  Users,
  FileText,
  Bell,
  Settings,
  User,
  MessageCircle,
  Tag,
  DollarSign,
  Layout,
  ChevronRight,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Calendar,
  Wallet,
  Clock, // Added missing Clock icon
} from "lucide-react-native";
import AuthModal from "@/components/AuthModal";
import { Journalist } from "@/types/journalist";

// Mock admin stats
const adminStats = {
  totalArticles: 124,
  totalUsers: 3452,
  totalSubscribers: 876,
  totalJournalists: 18,
  pendingArticles: 7,
  pendingJournalistApplications: 3,
  revenueThisMonth: 2450,
  subscriptionBreakdown: {
    free: 2576,
    basic: 498,
    premium: 378
  }
};

// Mock journalists data
const mockJournalists: Journalist[] = [
  {
    id: "j1",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    username: "sarahjohnson",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    bio: "Tech writer with 5 years of experience",
    expertise: ["Technology", "Business"],
    articleCount: 24,
    status: "active",
    joinedAt: "2023-01-15",
    earnings: 450,
    walletAddress: "pi1q2w3e4r5t6y7u8i9o0p"
  },
  {
    id: "j2",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    username: "michaelchen",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    bio: "Finance writer and former analyst",
    expertise: ["Finance", "Economics"],
    articleCount: 18,
    status: "active",
    joinedAt: "2023-02-20",
    earnings: 320,
    walletAddress: "pi1a2s3d4f5g6h7j8k9l0"
  },
  {
    id: "j3",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@example.com",
    username: "emmarodriguez",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80",
    bio: "Cultural writer and art enthusiast",
    expertise: ["Culture", "Art"],
    articleCount: 15,
    status: "inactive",
    joinedAt: "2023-03-10",
    earnings: 280,
    walletAddress: "pi1z2x3c4v5b6n7m8"
  }
];

// Mock pending payments
const mockPendingPayments = [
  {
    id: "pp1",
    journalistId: "j1",
    journalistName: "Sarah Johnson",
    amount: 120,
    date: "2023-06-30",
    status: "pending",
    articles: 5,
    walletAddress: "pi1q2w3e4r5t6y7u8i9o0p"
  },
  {
    id: "pp2",
    journalistId: "j2",
    journalistName: "Michael Chen",
    amount: 90,
    date: "2023-06-30",
    status: "pending",
    articles: 4,
    walletAddress: "pi1a2s3d4f5g6h7j8k9l0"
  }
];

export default function AdminScreen() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [selectedArticles, setSelectedArticles] = useState<{id: string}[]>([]);
  const [pendingPayments, setPendingPayments] = useState(mockPendingPayments);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    // Fetch journalists data
    fetchJournalists();
    
    // Log authentication status for debugging
    console.log("Admin screen - Auth status:", { isAuthenticated, isAdmin });
  }, [isAuthenticated, isAdmin]);

  const fetchJournalists = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        setJournalists(mockJournalists);
        setLoading(false);
      }, 1000);
    } catch (error: unknown) {
      console.error("Error fetching journalists:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to load journalists data");
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchJournalists();
    setIsRefreshing(false);
  };

  const handleProcessPayment = (payment: any) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!selectedPayment) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Remove from pending payments
      setPendingPayments(pendingPayments.filter(p => p.id !== selectedPayment.id));
      
      // Show success message
      Alert.alert(
        "Payment Processed",
        `Payment of ${selectedPayment.amount} π has been sent to ${selectedPayment.journalistName}.`,
        [{ text: "OK" }]
      );
      
      setShowPaymentModal(false);
      setSelectedPayment(null);
      setLoading(false);
    }, 1500);
  };

  const filteredJournalists = journalists.filter(journalist => {
    const matchesSearch = 
      journalist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journalist.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journalist.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === null || journalist.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Lock size={48} color={colors.primary} />
        <Text style={[typography.h2, styles.authTitle]}>Admin Access</Text>
        <Text style={[typography.body, styles.authText]}>
          Please sign in to access the admin portal.
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => setShowAuthModal(true)}
        >
          <Text style={styles.authButtonText}>Sign In</Text>
        </TouchableOpacity>
        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.authContainer}>
        <Lock size={48} color={colors.primary} />
        <Text style={[typography.h2, styles.authTitle]}>Admin Access</Text>
        <Text style={[typography.body, styles.authText]}>
          You need admin privileges to access this section.
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.authButtonText}>Back to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderAdminMenuItem = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    badge?: number,
    onPress?: () => void
  ) => {
    return (
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemIcon}>{icon}</View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
        </View>
        {badge !== undefined && (
          <View style={styles.menuItemBadge}>
            <Text style={styles.menuItemBadgeText}>{badge}</Text>
          </View>
        )}
        <ChevronRight size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const JournalistsList = ({ 
    journalists, 
    onRefresh, 
    isRefreshing 
  }: { 
    journalists: Journalist[], 
    onRefresh: () => Promise<void>, 
    isRefreshing: boolean 
  }) => {
    const renderJournalistItem = (journalist: Journalist) => {
      const getStatusIcon = (status: string) => {
        switch (status) {
          case "active":
            return <CheckCircle size={16} color="#10b981" />;
          case "inactive":
            return <AlertCircle size={16} color="#f59e0b" />;
          case "suspended":
            return <XCircle size={16} color="#ef4444" />;
          default:
            return null;
        }
      };

      const updateJournalistStatus = (journalistId: string, newStatus: string) => {
        // In a real app, this would be an API call
        Alert.alert(
          "Update Status",
          `Are you sure you want to change this journalist's status to ${newStatus}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Confirm",
              onPress: () => {
                setJournalists(
                  journalists.map(j => 
                    j.id === journalistId 
                      ? { ...j, status: newStatus as "active" | "inactive" | "suspended" } 
                      : j
                  )
                );
              }
            }
          ]
        );
      };

      const viewJournalistDetails = (journalistId: string) => {
        router.push(`/journalist/${journalistId}`);
      };

      return (
        <View style={styles.journalistCard}>
          <View style={styles.journalistHeader}>
            <View style={styles.journalistInfo}>
              <Text style={styles.journalistName}>{journalist.name}</Text>
              <Text style={styles.journalistUsername}>@{journalist.username}</Text>
            </View>
            <View style={styles.journalistStatus}>
              {getStatusIcon(journalist.status)}
              <Text 
                style={[
                  styles.journalistStatusText,
                  { 
                    color: 
                      journalist.status === "active" ? "#10b981" : 
                      journalist.status === "inactive" ? "#f59e0b" : "#ef4444" 
                  }
                ]}
              >
                {journalist.status.charAt(0).toUpperCase() + journalist.status.slice(1)}
              </Text>
            </View>
          </View>
          
          <View style={styles.journalistStats}>
            <View style={styles.journalistStat}>
              <Text style={styles.journalistStatValue}>{journalist.articleCount}</Text>
              <Text style={styles.journalistStatLabel}>Articles</Text>
            </View>
            <View style={styles.journalistStat}>
              <Text style={styles.journalistStatValue}>{journalist.earnings} π</Text>
              <Text style={styles.journalistStatLabel}>Earnings</Text>
            </View>
            <View style={styles.journalistStat}>
              <Text style={styles.journalistStatValue}>
                {new Date(journalist.joinedAt).toLocaleDateString("en-US", { 
                  year: "numeric", 
                  month: "short", 
                  day: "numeric" 
                })}
              </Text>
              <Text style={styles.journalistStatLabel}>Joined</Text>
            </View>
          </View>
          
          <View style={styles.walletContainer}>
            <Wallet size={16} color={colors.textSecondary} />
            <Text style={styles.walletLabel}>Wallet: </Text>
            <Text style={styles.walletAddress} numberOfLines={1}>
              {journalist.walletAddress || "Not connected"}
            </Text>
          </View>
          
          <View style={styles.journalistActions}>
            <TouchableOpacity 
              style={styles.journalistAction}
              onPress={() => viewJournalistDetails(journalist.id)}
            >
              <Text style={styles.journalistActionText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.journalistAction}
              onPress={() => updateJournalistStatus(
                journalist.id, 
                journalist.status === "active" ? "inactive" : "active"
              )}
            >
              <Text style={styles.journalistActionText}>
                {journalist.status === "active" ? "Deactivate" : "Activate"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    };

    return (
      <>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search journalists..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => {
              // Cycle through filter options: null (All) -> active -> inactive -> null
              if (filterStatus === null) setFilterStatus("active");
              else if (filterStatus === "active") setFilterStatus("inactive");
              else setFilterStatus(null);
            }}
          >
            <Filter size={20} color={colors.primary} />
            <Text style={styles.filterButtonText}>
              {filterStatus === null ? "All" : 
               filterStatus === "active" ? "Active" : "Inactive"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={filteredJournalists}
          renderItem={({ item }) => renderJournalistItem(item)}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.journalistsList}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No journalists found</Text>
            </View>
          }
        />
      </>
    );
  };

  const renderPaymentsTab = () => (
    <>
      <View style={styles.paymentsHeader}>
        <Text style={styles.paymentsTitle}>Pending Payments</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Download size={16} color={colors.primary} />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>
      
      {pendingPayments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending payments</Text>
        </View>
      ) : (
        <View style={styles.paymentsContainer}>
          {pendingPayments.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentJournalist}>{payment.journalistName}</Text>
                <View style={styles.paymentStatusBadge}>
                  <Clock size={12} color="#f59e0b" />
                  <Text style={styles.paymentStatusText}>Pending</Text>
                </View>
              </View>
              
              <View style={styles.paymentDetails}>
                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentDetailLabel}>Amount:</Text>
                  <Text style={styles.paymentDetailValue}>{payment.amount} π</Text>
                </View>
                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentDetailLabel}>Date:</Text>
                  <Text style={styles.paymentDetailValue}>{payment.date}</Text>
                </View>
                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentDetailLabel}>Articles:</Text>
                  <Text style={styles.paymentDetailValue}>{payment.articles}</Text>
                </View>
              </View>
              
              <View style={styles.walletContainer}>
                <Wallet size={16} color={colors.textSecondary} />
                <Text style={styles.walletLabel}>Wallet: </Text>
                <Text style={styles.walletAddress} numberOfLines={1}>
                  {payment.walletAddress}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.processButton}
                onPress={() => handleProcessPayment(payment)}
              >
                <DollarSign size={16} color={colors.card} />
                <Text style={styles.processButtonText}>Process Payment</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.paymentHistorySection}>
        <Text style={styles.sectionTitle}>Recent Payments</Text>
        
        <View style={styles.paymentHistoryCard}>
          <View style={styles.paymentHistoryHeader}>
            <Text style={styles.paymentHistoryJournalist}>Sarah Johnson</Text>
            <Text style={styles.paymentHistoryDate}>June 1, 2023</Text>
          </View>
          <View style={styles.paymentHistoryDetails}>
            <Text style={styles.paymentHistoryAmount}>120 π</Text>
            <View style={styles.paymentHistoryStatusBadge}>
              <CheckCircle size={12} color="#10b981" />
              <Text style={styles.paymentHistoryStatusText}>Completed</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.paymentHistoryCard}>
          <View style={styles.paymentHistoryHeader}>
            <Text style={styles.paymentHistoryJournalist}>Michael Chen</Text>
            <Text style={styles.paymentHistoryDate}>June 1, 2023</Text>
          </View>
          <View style={styles.paymentHistoryDetails}>
            <Text style={styles.paymentHistoryAmount}>90 π</Text>
            <View style={styles.paymentHistoryStatusBadge}>
              <CheckCircle size={12} color="#10b981" />
              <Text style={styles.paymentHistoryStatusText}>Completed</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.viewAllPaymentsButton}
          onPress={() => router.push("/payment-history")}
        >
          <Text style={styles.viewAllPaymentsText}>View All Payments</Text>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Payment Confirmation Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            
            {selectedPayment && (
              <>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>
                    You are about to process a payment of <Text style={styles.modalHighlight}>{selectedPayment.amount} π</Text> to <Text style={styles.modalHighlight}>{selectedPayment.journalistName}</Text>.
                  </Text>
                  
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Wallet Address:</Text>
                    <Text style={styles.modalDetailValue}>{selectedPayment.walletAddress}</Text>
                  </View>
                  
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Articles:</Text>
                    <Text style={styles.modalDetailValue}>{selectedPayment.articles}</Text>
                  </View>
                  
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>Date:</Text>
                    <Text style={styles.modalDetailValue}>{selectedPayment.date}</Text>
                  </View>
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalCancelButton}
                    onPress={() => setShowPaymentModal(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.modalConfirmButton}
                    onPress={confirmPayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colors.card} />
                    ) : (
                      <Text style={styles.modalConfirmButtonText}>Confirm Payment</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );

  const renderDashboardTab = () => (
    <>
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{adminStats.totalArticles}</Text>
            <Text style={styles.statLabel}>Articles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{adminStats.totalUsers}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {adminStats.totalSubscribers}
            </Text>
            <Text style={styles.statLabel}>Subscribers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {adminStats.totalJournalists}
            </Text>
            <Text style={styles.statLabel}>Journalists</Text>
          </View>
        </View>
      </View>

      <View style={styles.subscriptionBreakdown}>
        <Text style={styles.sectionTitle}>Subscription Breakdown</Text>
        <View style={styles.planRow}>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>Free Plan</Text>
            <Text style={styles.planCount}>{adminStats.subscriptionBreakdown.free} users</Text>
          </View>
          <View style={styles.planBar}>
            <View 
              style={[
                styles.planBarFill, 
                { 
                  width: `${(adminStats.subscriptionBreakdown.free / adminStats.totalUsers) * 100}%`,
                  backgroundColor: colors.textSecondary
                }
              ]} 
            />
          </View>
        </View>
        <View style={styles.planRow}>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>Basic Plan (6π)</Text>
            <Text style={styles.planCount}>{adminStats.subscriptionBreakdown.basic} users</Text>
          </View>
          <View style={styles.planBar}>
            <View 
              style={[
                styles.planBarFill, 
                { 
                  width: `${(adminStats.subscriptionBreakdown.basic / adminStats.totalUsers) * 100}%`,
                  backgroundColor: "#0891b2"
                }
              ]} 
            />
          </View>
        </View>
        <View style={styles.planRow}>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>Premium Plan (10π)</Text>
            <Text style={styles.planCount}>{adminStats.subscriptionBreakdown.premium} users</Text>
          </View>
          <View style={styles.planBar}>
            <View 
              style={[
                styles.planBarFill, 
                { 
                  width: `${(adminStats.subscriptionBreakdown.premium / adminStats.totalUsers) * 100}%`,
                  backgroundColor: colors.primary
                }
              ]} 
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {renderAdminMenuItem(
          <BarChart2 size={24} color={colors.primary} />,
          "Dashboard & Analytics",
          "View platform performance metrics",
          undefined,
          () => {}
        )}
        {renderAdminMenuItem(
          <FileText size={24} color={colors.primary} />,
          "Content Management",
          "Create and manage articles",
          adminStats.pendingArticles,
          () => {}
        )}
        {renderAdminMenuItem(
          <Users size={24} color={colors.primary} />,
          "User Management",
          "Manage readers and journalists",
          undefined,
          () => {}
        )}
        {renderAdminMenuItem(
          <User size={24} color={colors.primary} />,
          "Journalist Applications",
          "Review and approve applications",
          adminStats.pendingJournalistApplications,
          () => router.push("/journalist-applications")
        )}
        {renderAdminMenuItem(
          <MessageCircle size={24} color={colors.primary} />,
          "Comment Moderation",
          "Moderate user comments",
          undefined,
          () => {}
        )}
        {renderAdminMenuItem(
          <Bell size={24} color={colors.primary} />,
          "Push Notifications",
          "Send alerts to users",
          undefined,
          () => {}
        )}
        {renderAdminMenuItem(
          <Tag size={24} color={colors.primary} />,
          "Category Management",
          "Manage content categories",
          undefined,
          () => {}
        )}
        {renderAdminMenuItem(
          <DollarSign size={24} color={colors.primary} />,
          "Subscription Management",
          "Track Pi subscriptions",
          undefined,
          () => {}
        )}
        {renderAdminMenuItem(
          <Layout size={24} color={colors.primary} />,
          "Ad Management",
          "Manage Pi Ad Network integration",
          undefined,
          () => {}
        )}
        {renderAdminMenuItem(
          <Settings size={24} color={colors.primary} />,
          "Settings",
          "Configure platform settings",
          undefined,
          () => {}
        )}
      </View>

      <View style={styles.revenueCard}>
        <Text style={styles.revenueTitle}>Pi Revenue This Month</Text>
        <Text style={styles.revenueValue}>{adminStats.revenueThisMonth} π</Text>
        <TouchableOpacity style={styles.revenueButton}>
          <Text style={styles.revenueButtonText}>View Revenue Report</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderJournalistsTab = () => (
    <>
      <View style={styles.journalistsHeader}>
        <Text style={styles.journalistsTitle}>Manage Journalists</Text>
        <TouchableOpacity 
          style={styles.addJournalistButton}
          onPress={() => router.push("/journalist-applications")}
        >
          <Text style={styles.addJournalistButtonText}>View Applications</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading journalists...</Text>
        </View>
      ) : (
        <JournalistsList 
          journalists={filteredJournalists} 
          onRefresh={onRefresh} 
          isRefreshing={isRefreshing} 
        />
      )}
    </>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>Admin Portal</Text>
        <Text style={styles.subtitle}>Manage your Trend Forge platform</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedTab === "dashboard" && styles.activeTabItem
          ]}
          onPress={() => setSelectedTab("dashboard")}
        >
          <BarChart2 
            size={20} 
            color={selectedTab === "dashboard" ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.tabText,
              selectedTab === "dashboard" && styles.activeTabText
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedTab === "journalists" && styles.activeTabItem
          ]}
          onPress={() => setSelectedTab("journalists")}
        >
          <Users 
            size={20} 
            color={selectedTab === "journalists" ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.tabText,
              selectedTab === "journalists" && styles.activeTabText
            ]}
          >
            Journalists
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedTab === "payments" && styles.activeTabItem
          ]}
          onPress={() => setSelectedTab("payments")}
        >
          <DollarSign 
            size={20} 
            color={selectedTab === "payments" ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.tabText,
              selectedTab === "payments" && styles.activeTabText
            ]}
          >
            Payments
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedTab === "settings" && styles.activeTabItem
          ]}
          onPress={() => setSelectedTab("settings")}
        >
          <Settings 
            size={20} 
            color={selectedTab === "settings" ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.tabText,
              selectedTab === "settings" && styles.activeTabText
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === "dashboard" && renderDashboardTab()}
      {selectedTab === "journalists" && renderJournalistsTab()}
      {selectedTab === "payments" && renderPaymentsTab()}
      {selectedTab === "settings" && (
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonText}>Settings panel coming soon</Text>
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
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  authTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  authText: {
    textAlign: "center",
    marginBottom: 24,
    color: colors.textSecondary,
  },
  authButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  authButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    ...typography.body,
    color: colors.textSecondary,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 4,
  },
  activeTabItem: {
    backgroundColor: colors.background,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "500",
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    width: "48%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  subscriptionBreakdown: {
    padding: 16,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planRow: {
    marginBottom: 12,
  },
  planInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  planName: {
    ...typography.body,
    fontWeight: "500",
  },
  planCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  planBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  planBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
    padding: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemIcon: {
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  menuItemBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  menuItemBadgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: "bold",
  },
  revenueCard: {
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  revenueTitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  revenueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  revenueButtonText: {
    color: colors.card,
    fontWeight: "500",
  },
  journalistsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  journalistsTitle: {
    ...typography.h3,
  },
  addJournalistButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addJournalistButtonText: {
    color: colors.card,
    fontWeight: "500",
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    color: colors.text,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: 4,
  },
  journalistsList: {
    padding: 16,
    paddingTop: 0,
  },
  journalistCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  journalistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  journalistInfo: {
    flex: 1,
  },
  journalistName: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  journalistUsername: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  journalistStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  journalistStatusText: {
    ...typography.caption,
    fontWeight: "500",
    marginLeft: 4,
  },
  journalistStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  journalistStat: {
    alignItems: "center",
  },
  journalistStatValue: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  journalistStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  walletContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  walletLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  walletAddress: {
    ...typography.caption,
    flex: 1,
  },
  journalistActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  journalistAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  journalistActionText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  comingSoonContainer: {
    padding: 32,
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    margin: 16,
  },
  comingSoonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  // Payment tab styles
  paymentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
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
  paymentsContainer: {
    paddingHorizontal: 16,
  },
  paymentCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentJournalist: {
    ...typography.body,
    fontWeight: "500",
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
  paymentDetails: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentDetailLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  paymentDetailValue: {
    ...typography.bodySmall,
    fontWeight: "500",
  },
  processButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  processButtonText: {
    ...typography.body,
    color: colors.card,
    fontWeight: "500",
    marginLeft: 8,
  },
  paymentHistorySection: {
    padding: 16,
    marginBottom: 32,
  },
  paymentHistoryCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentHistoryJournalist: {
    ...typography.body,
    fontWeight: "500",
  },
  paymentHistoryDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  paymentHistoryDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentHistoryAmount: {
    ...typography.body,
    fontWeight: "500",
  },
  paymentHistoryStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b98120", // green with 20% opacity
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentHistoryStatusText: {
    ...typography.caption,
    color: "#10b981", // green
    marginLeft: 4,
  },
  viewAllPaymentsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  viewAllPaymentsText: {
    ...typography.body,
    color: colors.primary,
    marginRight: 4,
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
  modalTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  modalContent: {
    marginBottom: 24,
  },
  modalText: {
    ...typography.body,
    marginBottom: 16,
  },
  modalHighlight: {
    fontWeight: "600",
    color: colors.primary,
  },
  modalDetail: {
    flexDirection: "row",
    marginBottom: 8,
  },
  modalDetailLabel: {
    ...typography.body,
    width: 120,
    color: colors.textSecondary,
  },
  modalDetailValue: {
    ...typography.body,
    flex: 1,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  modalCancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalConfirmButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    ...typography.body,
    color: colors.card,
    fontWeight: "500",
  },
});
