import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { fetchLatestNews, fetchCategories, fetchNewsByCategory, fetchMockNews, fetchMockCategories, NewsItem } from '@/utils/news-api';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import ArticleCard from '@/components/ArticleCard';
import { trpc } from '@/lib/trpc';
import { Filter } from 'lucide-react-native';

export default function CryptoNewsScreen() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<{id: string; name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use tRPC to fetch news and categories
  const newsQuery = trpc.cryptoNews.getNews.useQuery(
    { limit: 50, categories: selectedCategory ? [selectedCategory] : undefined },
    { enabled: !refreshing }
  );
  
  const categoriesQuery = trpc.cryptoNews.getCategories.useQuery(
    undefined,
    { enabled: !refreshing }
  );
  
  // Load news and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if we have tRPC data
        if (!newsQuery.isLoading && newsQuery.data) {
          setNews(newsQuery.data.news);
        } else if (!newsQuery.isLoading && newsQuery.error) {
          console.error('Error fetching crypto news:', newsQuery.error);
          setError('Failed to load crypto news. Please try again later.');
          
          // Fallback to direct API call
          const apiNews = selectedCategory 
            ? await fetchNewsByCategory(selectedCategory, 50)
            : await fetchLatestNews(50);
            
          if (apiNews.length > 0) {
            setNews(apiNews);
            setError(null);
          } else {
            // Use mock data as last resort
            setNews(fetchMockNews(50));
          }
        }
        
        // Load categories
        if (!categoriesQuery.isLoading && categoriesQuery.data) {
          setCategories(categoriesQuery.data.categories);
        } else if (!categoriesQuery.isLoading && categoriesQuery.error) {
          console.error('Error fetching categories:', categoriesQuery.error);
          
          // Fallback to direct API call
          const apiCategories = await fetchCategories();
          if (apiCategories.length > 0) {
            setCategories(apiCategories);
          } else {
            // Use mock categories as last resort
            setCategories(fetchMockCategories());
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
        
        // Use mock data as fallback
        setNews(fetchMockNews(50));
        setCategories(fetchMockCategories());
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    loadData();
  }, [selectedCategory, newsQuery.data, newsQuery.error, newsQuery.isLoading, 
      categoriesQuery.data, categoriesQuery.error, categoriesQuery.isLoading]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    newsQuery.refetch();
    categoriesQuery.refetch();
  };
  
  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };
  
  // Convert NewsItem to ArticleCard format
  const mapNewsToArticle = (newsItem: NewsItem) => {
    return {
      id: newsItem.id,
      title: newsItem.title,
      summary: newsItem.body.substring(0, 120) + '...', // Create summary from body
      content: newsItem.body,
      imageUrl: newsItem.imageUrl,
      image: newsItem.imageUrl, // Keep for backward compatibility
      category: newsItem.categories[0] || 'Crypto',
      date: newsItem.publishedOn,
      publishedAt: newsItem.publishedOn, // Add required property
      isPremium: false, // Default to non-premium
      readTime: Math.ceil(newsItem.body.length / 1000), // Estimate read time
      likes: 0,
      comments: 0,
      views: 0,
      author: {
        id: 'crypto-' + newsItem.id,
        name: newsItem.author,
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
      },
      url: newsItem.url,
      source: newsItem.source,
      externalLink: true
    };
  };
  
  const renderCategoryItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <View style={styles.articleContainer}>
      <ArticleCard article={mapNewsToArticle(item)} />
    </View>
  );
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Crypto News",
          headerRight: () => (
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color={colors.text} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.container}>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        
        {/* News List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={news}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.newsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No news articles found</Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterButton: {
    padding: 8,
  },
  categoriesContainer: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  selectedCategoryItem: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  selectedCategoryText: {
    color: colors.card,
    fontWeight: '500',
  },
  newsList: {
    padding: 16,
  },
  articleContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.card,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.secondary,
  },
});
