import React, { useState, useEffect, useRef } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { featuredArticles, latestArticles, getArticlesByCategory } from "@/mocks/articles";
import { categories } from "@/mocks/categories";
import { journalists } from "@/mocks/journalists";
import ArticleCard from "@/components/ArticleCard";
import SectionHeader from "@/components/SectionHeader";
import CategoryList from "@/components/CategoryList";
import { useAuthStore } from "@/store/auth-store";
import AuthModal from "@/components/AuthModal";
import ArticleLimitModal from "@/components/ArticleLimitModal";
import PremiumContentModal from "@/components/PremiumContentModal";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import PiAdBanner from "@/components/PiAdBanner";
import CryptoNewsSection from "@/components/CryptoNewsSection";
import PiPriceWidget from "@/components/PiPriceWidget";
import SearchBar from "@/components/SearchBar";
import JournalistCard from "@/components/JournalistCard";
import { Newspaper, TrendingUp, Users } from "lucide-react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { 
    isAuthenticated, 
    subscriptionPlan, 
    subscriptionStatus,
    checkSubscriptionExpiration,
    isSubscribed
  } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredArticles, setFilteredArticles] = useState(latestArticles);
  const [refreshing, setRefreshing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Check if user is on free plan to show ads
  const showAds = subscriptionPlan === "free";
  
  // Use a ref to track if we've already checked the subscription
  // to prevent infinite loops
  const hasCheckedSubscription = useRef(false);
  
  // Only check subscription expiration once when the component mounts
  useEffect(() => {
    if (isAuthenticated && !hasCheckedSubscription.current) {
      checkSubscriptionExpiration();
      hasCheckedSubscription.current = true;
    }
  }, [isAuthenticated]);
  
  // Update filtered articles when category changes
  useEffect(() => {
    if (selectedCategory) {
      setFilteredArticles(getArticlesByCategory(selectedCategory));
    } else {
      setFilteredArticles(latestArticles);
    }
  }, [selectedCategory]);
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const handleSeeAllLatest = () => {
    router.push("/category/latest");
  };
  
  const handleSeeAllCategory = () => {
    if (selectedCategory) {
      router.push(`/category/${selectedCategory}`);
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
    if (query) {
      const results = latestArticles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.summary.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredArticles(results);
    } else {
      if (selectedCategory) {
        setFilteredArticles(getArticlesByCategory(selectedCategory));
      } else {
        setFilteredArticles(latestArticles);
      }
    }
  };
  
  const handleArticlePress = (articleId: string) => {
    router.push(`/article/${articleId}`);
  };
  
  const handleJournalistPress = (journalistId: string) => {
    router.push(`/journalist/${journalistId}`);
  };
  
  const handleSubscribe = () => {
    router.push("/subscription-plans");
  };
  
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Top Ad Banner for Free Users */}
      {showAds && <PiAdBanner position="top" />}
      
      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch}
        placeholder="Search articles..."
      />
      
      {/* Categories */}
      <CategoryList
        onSelectCategory={handleCategorySelect}
        selectedCategory={selectedCategory}
      />
      
      {/* Featured Section */}
      <SectionHeader 
        title="Featured" 
        onSeeAll={() => router.push("/category/featured")}
      />
      
      {/* Featured Articles */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredContainer}
      >
        {featuredArticles.map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            variant="large" 
            onPress={() => handleArticlePress(article.id)}
          />
        ))}
      </ScrollView>
      
      {/* Subscription Banner (if authenticated but not subscribed) */}
      {isAuthenticated && !isSubscribed() && (
        <SubscriptionBanner onSubscribe={handleSubscribe} />
      )}
      
      {/* Latest News Section */}
      <SectionHeader 
        title="Latest News" 
        onSeeAll={handleSeeAllLatest}
      />
      
      {/* Latest Articles Grid */}
      <View style={styles.articlesGrid}>
        {filteredArticles.slice(0, 4).map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            style={styles.gridArticle}
            onPress={() => handleArticlePress(article.id)}
          />
        ))}
      </View>
      
      {/* Middle Ad Banner */}
      {showAds && <PiAdBanner position="middle" />}
      
      {/* Crypto News Section */}
      <SectionHeader 
        title="Crypto News" 
        onSeeAll={() => router.push("/category/crypto-news")}
      />
      
      {/* Crypto News Articles */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cryptoContainer}
      >
        {getArticlesByCategory("Crypto").slice(0, 5).map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="medium"
            onPress={() => handleArticlePress(article.id)}
          />
        ))}
      </ScrollView>
      
      {/* Pi Price Widget */}
      <PiPriceWidget />
      
      {/* Top Journalists Section */}
      <SectionHeader 
        title="Top Journalists" 
        onSeeAll={() => router.push("/journalists")}
      />
      
      {/* Journalists List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.journalistsContainer}
      >
        {journalists.slice(0, 5).map((journalist) => (
          <JournalistCard
            key={journalist.id}
            journalist={journalist}
            onPress={() => handleJournalistPress(journalist.id)}
          />
        ))}
      </ScrollView>
      
      {/* Bottom Ad Banner */}
      {showAds && <PiAdBanner position="bottom" />}
      
      {/* Modals */}
      <AuthModal 
        visible={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <ArticleLimitModal 
        visible={showLimitModal} 
        onClose={() => setShowLimitModal(false)}
        onSuccess={() => {}}
        articleId=""
      />
      
      <PremiumContentModal 
        visible={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        onSuccess={() => {}}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  featuredContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  articlesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  gridArticle: {
    width: "48%",
    marginBottom: 16,
  },
  cryptoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  journalistsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
});
