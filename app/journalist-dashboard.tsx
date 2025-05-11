import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/auth-store";
import { articles } from "@/mocks/articles";
import { formatDate } from "@/utils/date-formatter";
import {
  Edit3,
  FileText,
  BarChart2,
  DollarSign,
  ChevronRight,
  Clock,
  Eye,
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react-native";
import { useTaskStore } from "@/store/task-store";
import TaskCard from "@/components/TaskCard";
import PerformanceChart from "@/components/PerformanceChart";
import { ArticleDraft, ArticleStatus } from "@/types/article-draft";

// Mock journalist stats
const journalistStats = {
  totalArticles: 12,
  totalViews: 24680,
  totalLikes: 1245,
  totalComments: 328,
  piEarned: 120,
  pendingPi: 15,
};

// Define the extended article type
type ExtendedArticle = ArticleDraft & {
  views: number;
  likes: number;
  comments: number;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  readTime: number;
};

// Mock journalist articles with proper typing
const journalistArticles: ExtendedArticle[] = articles.slice(0, 5).map(article => ({
  ...article,
  status: Math.random() > 0.3 ? "published" : "draft" as ArticleStatus,
  views: Math.floor(Math.random() * 5000),
  likes: Math.floor(Math.random() * 200),
  comments: Math.floor(Math.random() * 50),
  authorId: "current-user-id",
  authorName: "Current User",
  tags: [],
  updatedAt: new Date().toISOString(),
  publishedAt: article.publishedAt || new Date().toISOString(), // Ensure publishedAt is always defined
  author: {
    id: "current-user-id",
    name: "Current User",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  readTime: Math.floor(Math.random() * 10) + 2
}));

export default function JournalistDashboardScreen() {
  const router = useRouter();
  const { username, isJournalist, isAdmin } = useAuthStore();
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const [selectedTab, setSelectedTab] = useState("tasks");
  const [refreshing, setRefreshing] = useState(false);
  const [articleTab, setArticleTab] = useState("published");
  const [myArticles, setMyArticles] = useState<ExtendedArticle[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<{id: string}[]>([]);

  // Initialize with mock data
  useEffect(() => {
    setMyArticles(journalistArticles);
  }, []);

  // Check if user is journalist or admin
  if (!isJournalist && !isAdmin) {
    router.replace("/unauthorized");
    return null;
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTasks().finally(() => setRefreshing(false));
  }, []);

  const filteredArticles = myArticles.filter(
    article => article.status === articleTab
  );

  const pendingTasks = tasks.filter(task => task.status === "pending");
  const completedTasks = tasks.filter(task => task.status === "completed");
  const overdueTasks = tasks.filter(task => task.status === "overdue");

  const renderTasksTab = () => (
    <View style={styles.tasksContainer}>
      <View style={styles.tasksSummary}>
        <View style={styles.taskSummaryItem}>
          <View style={[styles.taskStatusIndicator, styles.pendingIndicator]}>
            <Clock size={20} color={colors.card} />
          </View>
          <Text style={styles.taskStatusCount}>{pendingTasks.length}</Text>
          <Text style={styles.taskStatusLabel}>Pending</Text>
        </View>
        <View style={styles.taskSummaryItem}>
          <View style={[styles.taskStatusIndicator, styles.completedIndicator]}>
            <CheckCircle size={20} color={colors.card} />
          </View>
          <Text style={styles.taskStatusCount}>{completedTasks.length}</Text>
          <Text style={styles.taskStatusLabel}>Completed</Text>
        </View>
        <View style={styles.taskSummaryItem}>
          <View style={[styles.taskStatusIndicator, styles.overdueIndicator]}>
            <AlertCircle size={20} color={colors.card} />
          </View>
          <Text style={styles.taskStatusCount}>{overdueTasks.length}</Text>
          <Text style={styles.taskStatusLabel}>Overdue</Text>
        </View>
      </View>

      <View style={styles.taskListHeader}>
        <Text style={styles.taskListTitle}>Today's Tasks</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/tasks")}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No tasks assigned yet</Text>
          <Text style={styles.emptySubtext}>
            Check back later or contact your editor
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks.slice(0, 5)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => router.push(`/task/${item.id}`)}
            />
          )}
          scrollEnabled={false}
          ListFooterComponent={
            tasks.length > 5 ? (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => router.push("/tasks")}
              >
                <Text style={styles.viewMoreText}>View More Tasks</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Daily Progress</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedTasks.length / Math.max(tasks.length, 1)) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedTasks.length}/{tasks.length} tasks completed
          </Text>
        </View>
      </View>
    </View>
  );

  const renderArticlesTab = () => (
    <View style={styles.articlesSection}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, articleTab === "published" && styles.activeTab]}
          onPress={() => setArticleTab("published")}
        >
          <Text
            style={[
              styles.tabText,
              articleTab === "published" && styles.activeTabText,
            ]}
          >
            Published
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, articleTab === "draft" && styles.activeTab]}
          onPress={() => setArticleTab("draft")}
        >
          <Text
            style={[
              styles.tabText,
              articleTab === "draft" && styles.activeTabText,
            ]}
          >
            Drafts
          </Text>
        </TouchableOpacity>
      </View>

      {filteredArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No {articleTab} articles found.
          </Text>
          {articleTab === "draft" && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/write-article")}
            >
              <Text style={styles.createButtonText}>Create New Draft</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item) => item.id || ""}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.articleCard}
              onPress={() => router.push(`/article/${item.id}`)}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.articleImage}
              />
              <View style={styles.articleContent}>
                <Text style={styles.articleCategory}>{item.category}</Text>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.articleDate}>
                  {formatDate(item.publishedAt)}
                </Text>
                <View style={styles.articleStats}>
                  <View style={styles.articleStat}>
                    <Eye size={12} color={colors.textSecondary} />
                    <Text style={styles.articleStatText}>
                      {item.views.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.articleStat}>
                    <ThumbsUp size={12} color={colors.textSecondary} />
                    <Text style={styles.articleStatText}>
                      {item.likes.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.articleStat}>
                    <MessageSquare size={12} color={colors.textSecondary} />
                    <Text style={styles.articleStatText}>
                      {item.comments.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => router.push("/my-articles")}
            >
              <Text style={styles.viewMoreText}>View All Articles</Text>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  );

  const renderEarningsTab = () => (
    <View style={styles.earningsContainer}>
      <View style={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <Text style={styles.earningsTitle}>Pi Earnings</Text>
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => router.push("/earnings")}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.earningsContent}>
          <View style={styles.earningsStat}>
            <DollarSign size={24} color={colors.primary} />
            <View>
              <Text style={styles.earningsValue}>{journalistStats.piEarned} π</Text>
              <Text style={styles.earningsLabel}>Total Earned</Text>
            </View>
          </View>
          <View style={styles.earningsStat}>
            <Clock size={24} color={colors.primary} />
            <View>
              <Text style={styles.earningsValue}>{journalistStats.pendingPi} π</Text>
              <Text style={styles.earningsLabel}>Pending</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.earningsBreakdown}>
        <Text style={styles.earningsBreakdownTitle}>Earnings Breakdown</Text>
        <View style={styles.earningsBreakdownItem}>
          <Text style={styles.earningsBreakdownLabel}>Basic Articles</Text>
          <Text style={styles.earningsBreakdownValue}>45 π</Text>
        </View>
        <View style={styles.earningsBreakdownItem}>
          <Text style={styles.earningsBreakdownLabel}>Premium Articles</Text>
          <Text style={styles.earningsBreakdownValue}>60 π</Text>
        </View>
        <View style={styles.earningsBreakdownItem}>
          <Text style={styles.earningsBreakdownLabel}>Performance Bonus</Text>
          <Text style={styles.earningsBreakdownValue}>15 π</Text>
        </View>
        <View style={styles.earningsBreakdownTotal}>
          <Text style={styles.earningsBreakdownTotalLabel}>Total This Month</Text>
          <Text style={styles.earningsBreakdownTotalValue}>120 π</Text>
        </View>
      </View>

      <View style={styles.paymentHistorySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push("/payment-history")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.paymentItem}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentDate}>May 31, 2023</Text>
            <Text style={styles.paymentAmount}>105 π</Text>
          </View>
          <Text style={styles.paymentStatus}>Completed</Text>
        </View>
        
        <View style={styles.paymentItem}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentDate}>April 30, 2023</Text>
            <Text style={styles.paymentAmount}>98 π</Text>
          </View>
          <Text style={styles.paymentStatus}>Completed</Text>
        </View>
        
        <View style={styles.paymentItem}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentDate}>March 31, 2023</Text>
            <Text style={styles.paymentAmount}>112 π</Text>
          </View>
          <Text style={styles.paymentStatus}>Completed</Text>
        </View>
      </View>
    </View>
  );

  const renderPerformanceTab = () => (
    <View style={styles.performanceContainer}>
      <View style={styles.rankingCard}>
        <View style={styles.rankingHeader}>
          <Award size={24} color={colors.primary} />
          <Text style={styles.rankingTitle}>Your Ranking</Text>
        </View>
        <View style={styles.rankingContent}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankNumber}>3</Text>
          </View>
          <Text style={styles.rankText}>of 18 Journalists</Text>
        </View>
        <Text style={styles.rankingSubtext}>
          You're in the top 20% of all journalists this month!
        </Text>
      </View>

      <View style={styles.performanceMetrics}>
        <Text style={styles.performanceMetricsTitle}>Performance Metrics</Text>
        
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricName}>Article Quality</Text>
            <Text style={styles.metricValue}>4.8/5.0</Text>
          </View>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: '96%', backgroundColor: '#10b981' }]} />
          </View>
        </View>
        
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricName}>Task Completion Rate</Text>
            <Text style={styles.metricValue}>92%</Text>
          </View>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: '92%', backgroundColor: '#10b981' }]} />
          </View>
        </View>
        
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricName}>On-Time Delivery</Text>
            <Text style={styles.metricValue}>88%</Text>
          </View>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: '88%', backgroundColor: '#10b981' }]} />
          </View>
        </View>
        
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricName}>Reader Engagement</Text>
            <Text style={styles.metricValue}>4.2/5.0</Text>
          </View>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: '84%', backgroundColor: '#f59e0b' }]} />
          </View>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <Text style={styles.achievementsTitle}>Achievements</Text>
        
        <View style={styles.achievementsList}>
          <View style={styles.achievementItem}>
            <View style={[styles.achievementIcon, { backgroundColor: '#8b5cf6' }]}>
              <TrendingUp size={20} color={colors.card} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Top Performer</Text>
              <Text style={styles.achievementDesc}>Ranked in top 5 for 3 consecutive weeks</Text>
            </View>
          </View>
          
          <View style={styles.achievementItem}>
            <View style={[styles.achievementIcon, { backgroundColor: '#f59e0b' }]}>
              <Award size={20} color={colors.card} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Quality Champion</Text>
              <Text style={styles.achievementDesc}>Maintained 4.5+ quality score for a month</Text>
            </View>
          </View>
          
          <View style={styles.achievementItem}>
            <View style={[styles.achievementIcon, { backgroundColor: '#10b981' }]}>
              <CheckCircle size={20} color={colors.card} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Perfect Week</Text>
              <Text style={styles.achievementDesc}>Completed all tasks on time for a full week</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Stack.Screen options={{ title: "Journalist Dashboard" }} />

      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>Journalist Dashboard</Text>
        <Text style={styles.subtitle}>
          Manage your tasks, articles and track performance
        </Text>
      </View>

      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Welcome back, <Text style={styles.usernameText}>{username}</Text>
        </Text>
        <TouchableOpacity
          style={styles.newArticleButton}
          onPress={() => router.push("/write-article")}
        >
          <Edit3 size={16} color={colors.card} />
          <Text style={styles.newArticleButtonText}>Write New Article</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBarItem, selectedTab === "tasks" && styles.activeTabBarItem]}
          onPress={() => setSelectedTab("tasks")}
        >
          <FileText size={20} color={selectedTab === "tasks" ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.tabBarText,
              selectedTab === "tasks" && styles.activeTabBarText,
            ]}
          >
            Tasks
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabBarItem, selectedTab === "articles" && styles.activeTabBarItem]}
          onPress={() => setSelectedTab("articles")}
        >
          <FileText size={20} color={selectedTab === "articles" ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.tabBarText,
              selectedTab === "articles" && styles.activeTabBarText,
            ]}
          >
            Articles
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabBarItem, selectedTab === "earnings" && styles.activeTabBarItem]}
          onPress={() => setSelectedTab("earnings")}
        >
          <DollarSign size={20} color={selectedTab === "earnings" ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.tabBarText,
              selectedTab === "earnings" && styles.activeTabBarText,
            ]}
          >
            Earnings
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabBarItem, selectedTab === "performance" && styles.activeTabBarItem]}
          onPress={() => setSelectedTab("performance")}
        >
          <BarChart2 size={20} color={selectedTab === "performance" ? colors.primary : colors.textSecondary} />
          <Text
            style={[
              styles.tabBarText,
              selectedTab === "performance" && styles.activeTabBarText,
            ]}
          >
            Performance
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === "tasks" && renderTasksTab()}
      {selectedTab === "articles" && renderArticlesTab()}
      {selectedTab === "earnings" && renderEarningsTab()}
      {selectedTab === "performance" && renderPerformanceTab()}

      <View style={styles.quickLinks}>
        <Text style={styles.quickLinksTitle}>Quick Links</Text>
        <View style={styles.quickLinksGrid}>
          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => router.push("/write-article")}
          >
            <Edit3 size={24} color={colors.primary} />
            <Text style={styles.quickLinkText}>Write Article</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => router.push("/my-articles")}
          >
            <FileText size={24} color={colors.primary} />
            <Text style={styles.quickLinkText}>My Articles</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => router.push("/analytics")}
          >
            <BarChart2 size={24} color={colors.primary} />
            <Text style={styles.quickLinkText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => router.push("/earnings")}
          >
            <DollarSign size={24} color={colors.primary} />
            <Text style={styles.quickLinkText}>Earnings</Text>
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
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.card,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  welcomeText: {
    ...typography.body,
  },
  usernameText: {
    fontWeight: "bold",
    color: colors.primary,
  },
  newArticleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  newArticleButtonText: {
    color: colors.card,
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 4,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
  },
  tabBarItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 4,
  },
  activeTabBarItem: {
    backgroundColor: colors.background,
  },
  tabBarText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  activeTabBarText: {
    color: colors.primary,
    fontWeight: "500",
  },
  tasksContainer: {
    padding: 16,
  },
  tasksSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  taskSummaryItem: {
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskStatusIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  pendingIndicator: {
    backgroundColor: "#f59e0b", // amber
  },
  completedIndicator: {
    backgroundColor: "#10b981", // green
  },
  overdueIndicator: {
    backgroundColor: "#ef4444", // red
  },
  taskStatusCount: {
    ...typography.h3,
    fontWeight: "bold",
  },
  taskStatusLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  taskListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskListTitle: {
    ...typography.h3,
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
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyText: {
    ...typography.body,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  createButtonText: {
    color: colors.card,
    fontWeight: "500",
  },
  viewMoreButton: {
    backgroundColor: colors.card,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewMoreText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "500",
  },
  progressSection: {
    marginTop: 16,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressTitle: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 12,
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: "100%",
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  articlesSection: {
    padding: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 4,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.card,
  },
  articleCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  articleImage: {
    width: 100,
    height: 100,
  },
  articleContent: {
    flex: 1,
    padding: 12,
  },
  articleCategory: {
    ...typography.caption,
    color: colors.primary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  articleTitle: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 4,
  },
  articleDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  articleStats: {
    flexDirection: "row",
    gap: 12,
  },
  articleStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  articleStatText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  earningsContainer: {
    padding: 16,
  },
  earningsCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  earningsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  earningsTitle: {
    ...typography.h3,
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
  earningsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  earningsStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 8,
  },
  earningsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  earningsBreakdown: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  earningsBreakdownTitle: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 12,
  },
  earningsBreakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  earningsBreakdownLabel: {
    ...typography.body,
  },
  earningsBreakdownValue: {
    ...typography.body,
    fontWeight: "500",
  },
  earningsBreakdownTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  earningsBreakdownTotalLabel: {
    ...typography.body,
    fontWeight: "500",
  },
  earningsBreakdownTotalValue: {
    ...typography.body,
    fontWeight: "bold",
    color: colors.primary,
  },
  paymentHistorySection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: "500",
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDate: {
    ...typography.body,
  },
  paymentAmount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  paymentStatus: {
    ...typography.bodySmall,
    color: "#10b981", // green
  },
  performanceContainer: {
    padding: 16,
  },
  rankingCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rankingTitle: {
    ...typography.h3,
    marginLeft: 8,
  },
  rankingContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rankBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.card,
  },
  rankText: {
    ...typography.body,
  },
  rankingSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
  performanceMetrics: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  performanceMetricsTitle: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 16,
  },
  metricItem: {
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metricName: {
    ...typography.body,
  },
  metricValue: {
    ...typography.body,
    fontWeight: "500",
  },
  metricBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  metricFill: {
    height: "100%",
    borderRadius: 4,
  },
  achievementsSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementsTitle: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 16,
  },
  achievementsList: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  achievementDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  quickLinks: {
    padding: 16,
    marginBottom: 32,
  },
  quickLinksTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  quickLinksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickLinkCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickLinkText: {
    ...typography.body,
    marginTop: 8,
  },
});
