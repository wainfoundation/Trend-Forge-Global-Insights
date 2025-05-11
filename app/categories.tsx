import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { categories } from "@/mocks/categories";
import { getArticlesByCategory } from "@/mocks/articles";
import { BookOpen, Briefcase, Globe, LineChart, Microscope, Music, Clock } from "lucide-react-native";

export default function CategoriesScreen() {
  const router = useRouter();
  
  const handleCategoryPress = (categoryName: string) => {
    router.push(`/category/${categoryName}`);
  };
  
  const getCategoryIcon = (iconName: string) => {
    const size = 24;
    const color = colors.card;
    
    switch (iconName) {
      case "Globe":
        return <Globe size={size} color={color} />;
      case "Briefcase":
        return <Briefcase size={size} color={color} />;
      case "LineChart":
        return <LineChart size={size} color={color} />;
      case "Microscope":
        return <Microscope size={size} color={color} />;
      case "Music":
        return <Music size={size} color={color} />;
      case "BookOpen":
        return <BookOpen size={size} color={color} />;
      default:
        return <Globe size={size} color={color} />;
    }
  };
  
  const getCategoryImage = (categoryName: string): string => {
    const articles = getArticlesByCategory(categoryName);
    return articles.length > 0 ? articles[0].imageUrl : "https://images.unsplash.com/photo-1557682250-33bd709cbe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1129&q=80";
  };
  
  const renderCategoryItem = ({ item }: { item: any }) => {
    const articleCount = getArticlesByCategory(item.name).length;
    const backgroundImage = getCategoryImage(item.name);
    
    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => handleCategoryPress(item.name)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: backgroundImage }}
          style={styles.categoryBackground}
          blurRadius={1}
        />
        <View style={styles.categoryOverlay} />
        <View style={styles.categoryContent}>
          <View style={styles.iconContainer}>
            {getCategoryIcon(item.icon)}
          </View>
          <Text style={styles.categoryName}>{item.name}</Text>
          <View style={styles.articleCountContainer}>
            <Clock size={12} color={colors.card} />
            <Text style={styles.articleCount}>{articleCount} articles</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>Browse Categories</Text>
        <Text style={[typography.bodySmall, styles.subtitle]}>
          Explore articles by topic
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.latestCategory}
        onPress={() => handleCategoryPress("latest")}
        activeOpacity={0.8}
      >
        <View style={styles.latestContent}>
          <Text style={[typography.h3, styles.latestTitle]}>Latest News</Text>
          <Text style={styles.latestSubtitle}>
            Stay updated with the most recent articles
          </Text>
        </View>
        <Clock size={32} color={colors.primary} />
      </TouchableOpacity>
      
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  latestCategory: {
    flexDirection: "row",
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  latestContent: {
    flex: 1,
  },
  latestTitle: {
    marginBottom: 4,
  },
  latestSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  categoryItem: {
    width: "48%",
    height: 160,
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  categoryBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  categoryContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryName: {
    color: colors.card,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  articleCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  articleCount: {
    color: colors.card,
    fontSize: 12,
    marginLeft: 4,
  },
});
