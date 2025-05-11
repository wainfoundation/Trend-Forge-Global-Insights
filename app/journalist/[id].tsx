import React from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { journalists } from "@/mocks/journalists";
import { articles } from "@/mocks/articles";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import ArticleCard from "@/components/ArticleCard";
import { Twitter } from "lucide-react-native";

export default function JournalistDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const journalist = journalists.find(j => j.id === id);
  const journalistArticles = articles.filter(
    article => article.author.id === id
  );
  
  if (!journalist) {
    return (
      <View style={styles.errorContainer}>
        <Text style={typography.h2}>Journalist not found</Text>
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
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: journalist.name,
          headerTitleStyle: { fontFamily: "serif" }
        }} 
      />
      
      <View style={styles.header}>
        <Image 
          source={{ uri: journalist.avatarUrl }} 
          style={styles.avatar}
        />
        <Text style={[typography.h2, styles.name]}>{journalist.name}</Text>
        
        <View style={styles.expertiseContainer}>
          {journalist.expertise.map((expertise, index) => (
            <View key={index} style={styles.expertiseTag}>
              <Text style={styles.expertiseText}>{expertise}</Text>
            </View>
          ))}
        </View>
        
        {journalist.twitter && (
          <TouchableOpacity style={styles.twitterButton}>
            <Twitter size={16} color={colors.card} />
            <Text style={styles.twitterText}>{journalist.twitter}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.bioSection}>
        <Text style={[typography.h3, styles.sectionTitle]}>Biography</Text>
        <Text style={[typography.body, styles.bioText]}>
          {journalist.bio}
        </Text>
      </View>
      
      <View style={styles.articlesSection}>
        <Text style={[typography.h3, styles.sectionTitle]}>
          Articles by {journalist.name.split(" ")[0]}
        </Text>
        
        {journalistArticles.length > 0 ? (
          <View style={styles.articlesList}>
            {journalistArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </View>
        ) : (
          <View style={styles.noArticlesContainer}>
            <Text style={styles.noArticlesText}>
              No articles found for this journalist.
            </Text>
          </View>
        )}
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
    backgroundColor: colors.card,
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    marginBottom: 12,
    textAlign: "center",
  },
  expertiseContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  expertiseTag: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expertiseText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  twitterButton: {
    flexDirection: "row",
    backgroundColor: "#1DA1F2", // Twitter blue
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    gap: 8,
  },
  twitterText: {
    color: colors.card,
    fontWeight: "500",
  },
  bioSection: {
    padding: 16,
    backgroundColor: colors.card,
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  bioText: {
    lineHeight: 24,
  },
  articlesSection: {
    padding: 16,
  },
  articlesList: {
    marginTop: 8,
  },
  noArticlesContainer: {
    padding: 24,
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 8,
  },
  noArticlesText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.card,
    fontWeight: "500",
  },
});
