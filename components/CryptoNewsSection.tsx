import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchLatestNews, fetchMockNews, NewsItem } from '@/utils/news-api';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import ArticleCard from './ArticleCard';
import SectionHeader from './SectionHeader';
import { trpc } from '@/lib/trpc';

interface CryptoNewsSectionProps {
  useMockData?: boolean;
  limit?: number;
  showHeader?: boolean;
  showSeeAll?: boolean;
}

export default function CryptoNewsSection({
  useMockData = false,
  limit = 5,
  showHeader = true,
  showSeeAll = true
}: CryptoNewsSectionProps) {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use tRPC to fetch news if not using mock data
  const cryptoNewsQuery = trpc.cryptoNews.getNews.useQuery(
    { limit },
    { enabled: !useMockData }
  );
  
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        
        if (useMockData) {
          // Use mock data for development
          const mockNews = fetchMockNews(limit);
          setNews(mockNews);
        } else if (!cryptoNewsQuery.isLoading && cryptoNewsQuery.data) {
          // Use tRPC data
          setNews(cryptoNewsQuery.data.news);
        } else if (!cryptoNewsQuery.isLoading && cryptoNewsQuery.error) {
          // Handle tRPC error
          console.error('Error fetching crypto news:', cryptoNewsQuery.error);
          setError('Failed to load crypto news. Please try again later.');
          
          // Fallback to direct API call
          const apiNews = await fetchLatestNews(limit);
          if (apiNews.length > 0) {
            setNews(apiNews);
            setError(null);
          }
        }
      } catch (err) {
        console.error('Error in CryptoNewsSection:', err);
        setError('Failed to load crypto news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadNews();
  }, [useMockData, limit, cryptoNewsQuery.data, cryptoNewsQuery.error, cryptoNewsQuery.isLoading]);
  
  const handleSeeAll = () => {
    router.push('/category/crypto-news');
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
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => cryptoNewsQuery.refetch()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (news.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      {showHeader && (
        <SectionHeader 
          title="Crypto News" 
          onSeeAll={showSeeAll ? handleSeeAll : undefined}
        />
      )}
      
      {news.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {news.map((item) => (
            <View key={item.id} style={styles.cardContainer}>
              <ArticleCard 
                article={mapNewsToArticle(item)} 
                variant="medium"
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  cardContainer: {
    width: 280,
    marginRight: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorLight,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: colors.card,
    fontWeight: '500',
  },
});
