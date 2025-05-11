import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
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
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react-native";
import { ArticleDraft, ArticleStatus, ArticleWithStats } from "@/types/article-draft";
import { getArticles, updateArticle } from "@/utils/firebase";

// Mock articles with status and proper typing
const myArticles: ArticleWithStats[] = articles.map((article) => ({
  ...article,
  status: ["published", "draft", "pending", "rejected"][
    Math.floor(Math.random() * 4)
  ] as ArticleStatus,
  views: Math.floor(Math.random() * 5000),
  likes: Math.floor(Math.random() * 200),
  comments: Math.floor(Math.random() * 50),
  authorId: "current-user-id",
  authorName: "Current User",
  tags: [],
  updatedAt: new Date().toISOString(),
  author: {
    id: "current-user-id",
    name: "Current User",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  readTime: Math.floor(Math.random() * 10) + 2
}));

// Helper function to get status color
const getStatusColor = (status: ArticleStatus) => {
  switch (status) {
    case "published":
      return "#10b981"; // green
    case "draft":
      return "#6b7280"; // gray
    case "pending":
      return "#f59e0b"; // amber
    case "rejected":
      return "#ef4444"; // red
    default:
      return colors.textSecondary;
  }
};

// Helper function to get status icon
const getStatusIcon = (status: ArticleStatus) => {
  switch (status) {
    case "published":
      return <CheckCircle size={16} color={getStatusColor(status)} />;
    case "draft":
      return <Clock size={16} color={getStatusColor(status)} />;
    case "pending":
      return <AlertCircle size={16} color={getStatusColor(status)} />;
    case "rejected":
      return <XCircle size={16} color={getStatusColor(status)} />;
    default:
      return null;
  }
};

export default function MyArticlesScreen() {
  const router = useRouter();
  const { isJournalist, isAdmin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ArticleStatus | null>(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<ArticleWithStats[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<{id: string}[]>([]);

  // Initialize with mock data
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Firebase
      // const articlesData = await getArticles();
      // setArticles(articlesData);
      
      // For now, use mock data
      setArticles(myArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      Alert.alert("Error", "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  // Check if user is journalist or admin
  if (!isJournalist && !isAdmin) {
    router.replace("/unauthorized");
    return null;
  }

  // Filter articles based on search query and status
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === null || article.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteArticle = (id: string) => {
    // In a real app, you would call an API to delete the article
    Alert.alert(
      "Delete Article",
      "Are you sure you want to delete this article?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
              setArticles(articles.filter(article => article.id !== id));
              setLoading(false);
            }, 1000);
          }
        }
      ]
    );
  };

  const handleEditArticle = (id: string) => {
    // Navigate to edit article screen
    router.push(`/write-article?id=${id}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: "My Articles" }} />

      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>My Articles</Text>
        <Text style={styles.subtitle}>
          Manage your published and draft articles
        </Text>
      </View>

      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowStatusFilter(!showStatusFilter)}
        >
          <Filter size={20} color={colors.text} />
          <Text style={styles.filterButtonText}>
            {selectedStatus ? selectedStatus : "All"}
          </Text>
          <ChevronDown
            size={16}
            color={colors.text}
            style={{
              transform: [{ rotate: showStatusFilter ? "180deg" : "0deg" }],
            }}
          />
        </TouchableOpacity>
      </View>

      {showStatusFilter && (
        <View style={styles.statusFilterContainer}>
          <TouchableOpacity
            style={[
              styles.statusFilterItem,
              selectedStatus === null && styles.statusFilterItemSelected,
            ]}
            onPress={() => {
              setSelectedStatus(null);
              setShowStatusFilter(false);
            }}
          >
            <Text
              style={[
                styles.statusFilterText,
                selectedStatus === null && styles.statusFilterTextSelected,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {["published", "draft", "pending", "rejected"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilterItem,
                selectedStatus === status && styles.statusFilterItemSelected,
              ]}
              onPress={() => {
                setSelectedStatus(status as ArticleStatus);
                setShowStatusFilter(false);
              }}
            >
              {getStatusIcon(status as ArticleStatus)}
              <Text
                style={[
                  styles.statusFilterText,
                  selectedStatus === status && styles.statusFilterTextSelected,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.newArticleButton}
        onPress={() => router.push("/write-article")}
      >
        <Edit3 size={20} color={colors.card} />
        <Text style={styles.newArticleButtonText}>Write New Article</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      ) : filteredArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No articles found.</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || selectedStatus
              ? "Try changing your search or filter."
              : "Start writing your first article!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item) => item.id || ""}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.articleCard}>
              <View style={styles.articleHeader}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.articleImage}
                />
                <View style={styles.articleHeaderContent}>
                  <View style={styles.articleMeta}>
                    <Text style={styles.articleCategory}>{item.category}</Text>
                    <View style={styles.statusBadge}>
                      {getStatusIcon(item.status)}
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(item.status) },
                        ]}
                      >
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.articleDate}>
                    {formatDate(item.publishedAt)}
                  </Text>
                </View>
              </View>

              <Text style={styles.articleSummary} numberOfLines={2}>
                {item.summary}
              </Text>

              <View style={styles.articleStats}>
                <View style={styles.articleStat}>
                  <Eye size={16} color={colors.textSecondary} />
                  <Text style={styles.articleStatText}>
                    {item.views.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.articleStat}>
                  <ThumbsUp size={16} color={colors.textSecondary} />
                  <Text style={styles.articleStatText}>
                    {item.likes.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.articleStat}>
                  <MessageSquare size={16} color={colors.textSecondary} />
                  <Text style={styles.articleStatText}>
                    {item.comments.toLocaleString()}
                  </Text>
                </View>
                {item.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumText}>Premium</Text>
                  </View>
                )}
              </View>

              <View style={styles.articleActions}>
                <TouchableOpacity
                  style={[styles.articleAction, styles.viewButton]}
                  onPress={() => router.push(`/article/${item.id}`)}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.articleAction, styles.editButton]}
                  onPress={() => handleEditArticle(item.id || "")}
                >
                  <Edit3 size={16} color={colors.primary} />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.articleAction, styles.deleteButton]}
                  onPress={() => handleDeleteArticle(item.id || "")}
                >
                  <Trash2 size={16} color={colors.error} />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
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
  searchFilterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  searchContainer: {
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
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  filterButtonText: {
    ...typography.bodySmall,
    color: colors.text,
    marginHorizontal: 4,
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
  },
  statusFilterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginVertical: 2,
  },
  statusFilterItemSelected: {
    backgroundColor: colors.primary + "20", // 20% opacity
  },
  statusFilterText: {
    ...typography.body,
    marginLeft: 8,
  },
  statusFilterTextSelected: {
    color: colors.primary,
    fontWeight: "500",
  },
  newArticleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newArticleButtonText: {
    ...typography.body,
    color: colors.card,
    fontWeight: "500",
    marginLeft: 8,
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
    margin: 16,
    borderRadius: 8,
  },
  emptyText: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
  articleCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  articleHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  articleHeaderContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  articleMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  articleCategory: {
    ...typography.caption,
    color: colors.primary,
    textTransform: "uppercase",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "500",
  },
  articleTitle: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 4,
  },
  articleDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  articleSummary: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  articleStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 16,
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
  premiumBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumText: {
    ...typography.caption,
    color: colors.card,
    fontWeight: "500",
  },
  articleActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  articleAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
  },
  viewButton: {
    backgroundColor: colors.background,
  },
  viewButtonText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  editButton: {
    backgroundColor: colors.primary + "10", // 10% opacity
    borderWidth: 1,
    borderColor: colors.primary + "30", // 30% opacity
  },
  editButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: colors.error + "10", // 10% opacity
    borderWidth: 1,
    borderColor: colors.error + "30", // 30% opacity
  },
  deleteButtonText: {
    ...typography.bodySmall,
    color: colors.error,
    marginLeft: 4,
  },
});
