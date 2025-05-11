import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { getArticlesByCategory, latestArticles } from "@/mocks/articles";
import ArticleCard from "@/components/ArticleCard";
import { Article } from "@/types/article";

export default function CategoryScreen() {
  const { name } = useLocalSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => {
      if (name === "latest") {
        setArticles(latestArticles);
      } else {
        setArticles(getArticlesByCategory(name as string));
      }
      setLoading(false);
    }, 500);
  }, [name]);
  
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>
          {name === "latest" ? "Latest News" : name}
        </Text>
        <Text style={styles.articleCount}>
          {articles.length} article{articles.length !== 1 ? "s" : ""}
        </Text>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: name === "latest" ? "Latest News" : name as string,
          headerTitleStyle: { fontFamily: "serif" }
        }} 
      />
      
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArticleCard article={item} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[typography.body, styles.emptyText]}>
              No articles found in this category.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  title: {
    marginBottom: 4,
  },
  articleCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
});
