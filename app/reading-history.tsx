import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { articles } from "@/mocks/articles";
import { formatDate } from "@/utils/date-formatter";
import { Article } from "@/types/article";
import { Clock, Trash2, Filter, ChevronDown } from "lucide-react-native";
import RewardedAdButton from "@/components/RewardedAdButton";

// Mock reading history
const generateMockReadingHistory = () => {
  // Select random articles
  const selectedArticles = [...articles]
    .sort(() => 0.5 - Math.random())
    .slice(0, 15);
  
  // Add read dates (within the last 30 days)
  return selectedArticles.map(article => {
    const daysAgo = Math.floor(Math.random() * 30);
    const readDate = new Date();
    readDate.setDate(readDate.getDate() - daysAgo);
    
    return {
      ...article,
      readAt: readDate.toISOString(),
    };
  }).sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime());
};

type ReadingHistoryItem = Article & { readAt: string };

export default function ReadingHistoryScreen() {
  const router = useRouter();
  const { isAuthenticated, subscriptionPlan } = useAuthStore();
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ReadingHistoryItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [hasUnlockedFullHistory, setHasUnlockedFullHistory] = useState(false);
  
  // Initialize reading history
  useEffect(() => {
    if (isAuthenticated) {
      const mockHistory = generateMockReadingHistory();
      setReadingHistory(mockHistory);
      setFilteredHistory(mockHistory);
    }
  }, [isAuthenticated]);
  
  // Apply filters when category changes
  useEffect(() => {
    if (filterCategory) {
      setFilteredHistory(
        readingHistory.filter(item => item.category === filterCategory)
      );
    } else {
      setFilteredHistory(readingHistory);
    }
  }, [filterCategory, readingHistory]);
  
  const handleArticlePress = (articleId: string) => {
    router.push(`/article/${articleId}`);
  };
  
  const handleClearHistory = () => {
    Alert.alert(
      "Clear Reading History",
      "Are you sure you want to clear your reading history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            setReadingHistory([]);
            setFilteredHistory([]);
          }
        }
      ]
    );
  };
  
  const handleFilterPress = (category: string | null) => {
    setFilterCategory(category);
    setShowFilters(false);
  };
  
  const handleAdReward = (adId: string) => {
    console.log("Rewarded ad viewed, adId:", adId);
    setHasUnlockedFullHistory(true);
    // In a real app, you would verify this adId with your backend
  };
  
  // Get unique categories from reading history
  const categories = [...new Set(readingHistory.map(item => item.category))];
  
  // Determine if we should show limited history
  const showLimitedHistory = subscriptionPlan === "free" && !hasUnlockedFullHistory;
  
  // Get the history items to display based on limits
  const historyToDisplay = showLimitedHistory 
    ? filteredHistory.slice(0, historyLimit) 
    : filteredHistory;
  
  const renderHistoryItem = ({ item }: { item: ReadingHistoryItem }) => {
    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleArticlePress(item.id)}
      >
        <View style={styles.historyItemContent}>
          <Text style={styles.historyItemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.historyItemMeta}>
            <Text style={styles.historyItemCategory}>{item.category}</Text>
            <View style={styles.historyItemTime}>
              <Clock size={12} color={colors.textSecondary} />
              <Text style={styles.historyItemDate}>
                {formatDate(item.readAt)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={[typography.h2, styles.authTitle]}>
          Sign In Required
        </Text>
        <Text style={[typography.body, styles.authText]}>
          Please sign in to view your reading history.
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.authButtonText}>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>Reading History</Text>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} color={colors.text} />
            <Text style={styles.filterButtonText}>
              {filterCategory || "All Categories"}
            </Text>
            <ChevronDown size={16} color={colors.text} />
          </TouchableOpacity>
          
          {showFilters && (
            <View style={styles.filterDropdown}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterCategory === null && styles.activeFilterOption,
                ]}
                onPress={() => handleFilterPress(null)}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterCategory === null && styles.activeFilterOptionText,
                ]}>
                  All Categories
                </Text>
              </TouchableOpacity>
              
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    filterCategory === category && styles.activeFilterOption,
                  ]}
                  onPress={() => handleFilterPress(category)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterCategory === category && styles.activeFilterOptionText,
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearHistory}
        >
          <Trash2 size={16} color={colors.error} />
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
      </View>
      
      {readingHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[typography.h3, styles.emptyTitle]}>
            No Reading History
          </Text>
          <Text style={[typography.body, styles.emptyText]}>
            Articles you read will appear here.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/")}
          >
            <Text style={styles.browseButtonText}>Browse Articles</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={historyToDisplay}
            keyExtractor={(item) => `${item.id}-${item.readAt}`}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.listContainer}
            ListFooterComponent={
              showLimitedHistory && filteredHistory.length > historyLimit ? (
                <View style={styles.limitContainer}>
                  <Text style={styles.limitText}>
                    Free users can only view their 10 most recent articles.
                  </Text>
                  <View style={styles.limitActions}>
                    <RewardedAdButton
                      buttonText="Watch Ad to Unlock Full History"
                      rewardText="Full history unlocked!"
                      onReward={handleAdReward}
                    />
                    <TouchableOpacity
                      style={styles.upgradeButton}
                      onPress={() => router.push("/subscription-plans")}
                    >
                      <Text style={styles.upgradeButtonText}>
                        Upgrade to Premium
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            }
          />
        </>
      )}
    </View>
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
    marginBottom: 16,
  },
  filterContainer: {
    position: "relative",
    zIndex: 1,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonText: {
    ...typography.body,
    flex: 1,
    marginHorizontal: 8,
  },
  filterDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    maxHeight: 200,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activeFilterOption: {
    backgroundColor: colors.primary + "20", // 20% opacity
  },
  filterOptionText: {
    ...typography.body,
  },
  activeFilterOptionText: {
    color: colors.primary,
    fontWeight: "500",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  clearButtonText: {
    ...typography.bodySmall,
    color: colors.error,
    marginLeft: 4,
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 8,
  },
  historyItemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyItemCategory: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "500",
  },
  historyItemTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyItemDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: colors.card,
    fontWeight: "600",
  },
  limitContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  limitText: {
    ...typography.body,
    textAlign: "center",
    marginBottom: 16,
  },
  limitActions: {
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: colors.card,
    fontWeight: "500",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  authTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  authText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  authButtonText: {
    color: colors.card,
    fontWeight: "600",
  },
});
