import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Platform, Share as RNShare } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, Heart, BookmarkPlus, MessageSquare, AlertTriangle } from 'lucide-react-native';
import { formatDate } from '@/utils/date-formatter';
import { mockArticles } from '@/mocks/articles';
import { Article } from '@/types/article';
import ArticleLimitModal from '@/components/ArticleLimitModal';
import PremiumContentModal from '@/components/PremiumContentModal';
import PiAdBanner from '@/components/PiAdBanner';
import DonationButton from '@/components/DonationButton';
import SplashScreen from '@/components/SplashScreen';

export default function ArticleDetailScreen() {
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const showLimitModalParam = typeof params.showLimitModal === 'string' ? params.showLimitModal : '';
  const showPremiumModalParam = typeof params.showPremiumModal === 'string' ? params.showPremiumModal : '';
  
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showAdBanner, setShowAdBanner] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(showLimitModalParam === "true");
  const [showPremiumModal, setShowPremiumModal] = useState(showPremiumModalParam === "true");
  const [adWatched, setAdWatched] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  const { 
    isAuthenticated, 
    subscriptionPlan, 
    subscriptionStatus,
    hasReachedArticleLimit, 
    hasWatchedAdForArticle,
    markAdWatched,
    isSubscribed
  } = useAuthStore();
  
  useEffect(() => {
    // In a real app, fetch the article from an API
    const foundArticle = mockArticles.find(a => a.id === id);
    
    // Simulate network delay
    setTimeout(() => {
      setArticle(foundArticle || null);
      setLoading(false);
      setShowSplash(false);
      
      // Check if user needs to see ad banner (free users for basic articles)
      if (foundArticle && !foundArticle.isPremium && subscriptionPlan === "free") {
        const hasWatched = hasWatchedAdForArticle(id);
        setAdWatched(hasWatched);
        setShowAdBanner(!hasWatched);
        
        // If they haven't watched an ad and haven't reached the limit, show the ad banner
        // If they have reached the limit, show the limit modal
        if (!hasWatched && hasReachedArticleLimit()) {
          setShowLimitModal(true);
        }
      }
    }, 1000);
  }, [id, hasWatchedAdForArticle]);

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      alert('Sharing is not available on web');
      return;
    }
    
    try {
      if (article) {
        await RNShare.share({
          message: `Check out this article: ${article.title}`,
          url: `https://trendforge.com/article/${article.id}`,
        });
      }
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    setLiked(!liked);
    // In a real app, send this to the server
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    setBookmarked(!bookmarked);
    // In a real app, send this to the server
  };

  const handleSubscribe = () => {
    router.push('/subscription-plans');
  };

  const handleAuthorPress = () => {
    if (article?.author?.id) {
      router.push(`/journalist/${article.author.id}`);
    }
  };

  const handleCategoryPress = () => {
    if (article?.category) {
      router.push(`/category/${article.category.toLowerCase()}`);
    }
  };
  
  const handleAdWatched = () => {
    // Mark this article as having had an ad watched
    markAdWatched(id);
    setAdWatched(true);
    setShowAdBanner(false);
  };

  const canAccessContent = () => {
    if (!article) return false;
    
    // Premium users can access all content
    if (subscriptionPlan === "premium") return true;
    
    // Basic users can access basic content but not premium
    if (subscriptionPlan === "basic") {
      return !article.isPremium;
    }
    
    // Free users need to watch ads for basic content and can't access premium
    if (subscriptionPlan === "free") {
      if (article.isPremium) return false;
      
      // Check if they've watched an ad for this article
      return adWatched || hasWatchedAdForArticle(id);
    }
    
    return false;
  };

  const renderContent = () => {
    if (!article) return null;
    
    // Premium content that requires premium subscription
    if (article.isPremium && subscriptionPlan !== "premium") {
      // For premium articles, show only a preview to non-premium users
      const previewContent = article.content.substring(0, 500) + '...';
      
      return (
        <View>
          <Text style={styles.content}>{previewContent}</Text>
          
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
            style={styles.gradientOverlay}
          />
          
          <View style={styles.premiumOverlay}>
            <Text style={styles.premiumText}>This is a premium article</Text>
            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={handleSubscribe}
            >
              <Text style={styles.subscribeButtonText}>Subscribe to Premium</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    // Basic content that requires ad viewing for free users
    if (!article.isPremium && subscriptionPlan === "free" && !adWatched) {
      const previewContent = article.content.substring(0, 300) + '...';
      
      return (
        <View>
          <Text style={styles.content}>{previewContent}</Text>
          
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
            style={styles.gradientOverlay}
          />
          
          <View style={styles.adOverlay}>
            <Text style={styles.adText}>Watch an ad to continue reading</Text>
            <PiAdBanner 
              position="middle" 
              onClose={() => {}} 
              onAdWatched={handleAdWatched}
              required={true}
            />
          </View>
        </View>
      );
    }
    
    // User can access full content
    return (
      <Text style={styles.content}>{article.content}</Text>
    );
  };

  if (showSplash || loading) {
    return (
      <View style={styles.loadingContainer}>
        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <>
            <ActivityIndicator size="large" color="#e3120b" />
            <Text style={styles.loadingText}>Loading article...</Text>
          </>
        )}
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color="#e3120b" />
        <Text style={styles.errorTitle}>Article Not Found</Text>
        <Text style={styles.errorText}>The article you're looking for doesn't exist or has been removed.</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Hero Image */}
        <Image 
          source={{ uri: article.imageUrl }} 
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        {/* Article Header */}
        <View style={styles.header}>
          {/* Category Badge */}
          <TouchableOpacity 
            style={styles.categoryBadge}
            onPress={handleCategoryPress}
          >
            <Text style={styles.categoryText}>{article.category}</Text>
          </TouchableOpacity>
          
          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>
          
          {/* Author Info */}
          <TouchableOpacity 
            style={styles.authorContainer}
            onPress={handleAuthorPress}
          >
            <Image 
              source={{ uri: article.author.avatarUrl || article.author.avatar }} 
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{article.author.name}</Text>
              <Text style={styles.publishInfo}>
                {formatDate(article.publishedAt || article.publishDate || new Date().toISOString())} • {article.readTime} min read
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Article Content */}
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
        
        {/* Donation Button */}
        {isAuthenticated && canAccessContent() && (
          <View style={styles.donationContainer}>
            <DonationButton 
              journalistId={article.author.id}
              journalistName={article.author.name}
              articleId={article.id}
            />
          </View>
        )}
        
        {/* Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Heart 
              size={24} 
              color={liked ? "#e3120b" : "#6b7280"}
              fill={liked ? "#e3120b" : "none"}
            />
            <Text style={styles.actionText}>{article.likes + (liked ? 1 : 0)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {}}
          >
            <MessageSquare size={24} color="#6b7280" />
            <Text style={styles.actionText}>{article.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleBookmark}
          >
            <BookmarkPlus 
              size={24} 
              color={bookmarked ? "#e3120b" : "#6b7280"}
              fill={bookmarked ? "#e3120b" : "none"}
            />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Share2 size={24} color="#6b7280" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Modals */}
      <ArticleLimitModal 
        visible={showLimitModal} 
        onClose={() => setShowLimitModal(false)}
        onSuccess={() => {
          setAdWatched(true);
          setShowAdBanner(false);
        }}
        articleId={id}
      />
      
      <PremiumContentModal 
        visible={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        onSuccess={() => {
          // Handle premium content access
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#e3120b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  header: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 36,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  publishInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 0,
  },
  content: {
    fontSize: 18,
    lineHeight: 28,
    color: '#1f2937',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  premiumOverlay: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  subscribeButton: {
    backgroundColor: '#e3120b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adOverlay: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    alignItems: 'center',
  },
  adText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  donationContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  }
});
