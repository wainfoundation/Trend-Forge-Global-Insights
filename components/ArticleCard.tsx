import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { Article } from "@/types/article";
import { formatDate } from "@/utils/date-formatter";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Lock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

interface ArticleCardProps {
  article: Article;
  variant?: "large" | "medium" | "small";
  style?: any;
  onPress?: () => void;
}

export default function ArticleCard({ article, variant = "medium", style, onPress }: ArticleCardProps) {
  const router = useRouter();
  const { 
    incrementArticleCount, 
    hasReachedArticleLimit, 
    subscriptionPlan, 
    hasWatchedAdForArticle,
    isSubscribed
  } = useAuthStore();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    
    // Check if article is premium and user doesn't have premium subscription
    if (article.isPremium && subscriptionPlan !== "premium") {
      router.push({
        pathname: "/article/[id]",
        params: { id: article.id, showPremiumModal: "true" }
      });
      return;
    }
    
    // Check if user has reached article limit for free users
    if (subscriptionPlan === "free" && hasReachedArticleLimit() && !hasWatchedAdForArticle(article.id)) {
      router.push({
        pathname: "/article/[id]",
        params: { id: article.id, showLimitModal: "true" }
      });
      return;
    }
    
    // Increment article count for free users
    if (subscriptionPlan === "free") {
      incrementArticleCount();
    }
    
    // Navigate to article
    router.push(`/article/${article.id}`);
  };
  
  // Determine if this article requires a subscription badge
  const showPremiumBadge = article.isPremium;
  
  // Determine if this article requires an ad badge for free users
  const showAdBadge = !article.isPremium && 
                      subscriptionPlan === "free" && 
                      !hasWatchedAdForArticle(article.id);
  
  // Helper function to safely format dates
  const safeFormatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return formatDate(dateString);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };
  
  if (variant === "large") {
    return (
      <TouchableOpacity 
        style={[styles.largeContainer, style]} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: article.imageUrl }} 
          style={styles.largeImage}
          resizeMode="cover"
        />
        <View style={styles.largeContent}>
          <Text style={typography.category}>{article.category}</Text>
          <View style={styles.titleRow}>
            <Text style={[typography.h3, styles.largeTitle]}>{article.title}</Text>
            {showPremiumBadge && (
              <Lock size={16} color={colors.primary} style={styles.lockIcon} />
            )}
          </View>
          <Text style={[typography.body, styles.summary]} numberOfLines={2}>
            {article.summary}
          </Text>
          <View style={styles.metaRow}>
            <Text style={typography.caption}>
              {safeFormatDate(article.publishedAt || article.publishDate || article.date)}
            </Text>
            <Text style={typography.caption}>{article.readTime} min read</Text>
          </View>
          
          {/* Subscription badges */}
          {showPremiumBadge && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
          
          {showAdBadge && (
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>Ad-Supported</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
  
  if (variant === "small") {
    return (
      <TouchableOpacity 
        style={[styles.smallContainer, style]} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.smallContent}>
          <Text style={typography.category}>{article.category}</Text>
          <View style={styles.titleRow}>
            <Text style={[typography.h4, styles.smallTitle]} numberOfLines={2}>
              {article.title}
            </Text>
            {showPremiumBadge && (
              <Lock size={14} color={colors.primary} style={styles.lockIcon} />
            )}
          </View>
          <Text style={typography.caption}>
            {safeFormatDate(article.publishedAt || article.publishDate || article.date)}
          </Text>
          
          {/* Subscription badges */}
          {showPremiumBadge && (
            <View style={[styles.premiumBadge, styles.smallBadge]}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
          
          {showAdBadge && (
            <View style={[styles.adBadge, styles.smallBadge]}>
              <Text style={styles.adBadgeText}>Ad-Supported</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
  
  // Default medium variant
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: article.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={typography.category}>{article.category}</Text>
        <View style={styles.titleRow}>
          <Text style={[typography.h4, styles.title]} numberOfLines={2}>
            {article.title}
          </Text>
          {showPremiumBadge && (
            <Lock size={14} color={colors.primary} style={styles.lockIcon} />
          )}
        </View>
        <Text style={[typography.bodySmall, styles.summary]} numberOfLines={2}>
          {article.summary}
        </Text>
        <View style={styles.metaRow}>
          <Text style={typography.caption}>
            {safeFormatDate(article.publishedAt || article.publishDate || article.date)}
          </Text>
          <Text style={typography.caption}>{article.readTime} min read</Text>
        </View>
        
        {/* Subscription badges */}
        {showPremiumBadge && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </View>
        )}
        
        {showAdBadge && (
          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>Ad-Supported</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  summary: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lockIcon: {
    marginTop: 4,
  },
  
  // Large variant styles
  largeContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    position: "relative",
  },
  largeImage: {
    width: "100%",
    height: 220,
  },
  largeContent: {
    padding: 16,
  },
  largeTitle: {
    flex: 1,
    marginRight: 8,
  },
  
  // Small variant styles
  smallContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    position: "relative",
  },
  smallContent: {
    padding: 12,
  },
  smallTitle: {
    flex: 1,
    marginRight: 8,
  },
  
  // Badge styles
  premiumBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumBadgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: "600",
  },
  adBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.secondary + "80", // 50% opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adBadgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: "600",
  },
  smallBadge: {
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
