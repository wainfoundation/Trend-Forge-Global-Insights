import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { searchArticles } from "@/mocks/articles";
import { searchJournalists } from "@/mocks/journalists";
import ArticleCard from "@/components/ArticleCard";
import JournalistCard from "@/components/JournalistCard";
import SearchBar from "@/components/SearchBar";
import { Article } from "@/types/article";
import { Filter } from "lucide-react-native";

type SearchTab = "articles" | "journalists";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("articles");
  const [articles, setArticles] = useState<Article[]>([]);
  const [journalists, setJournalists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (query.trim() === "") {
      setArticles([]);
      setJournalists([]);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (activeTab === "articles") {
        setArticles(searchArticles(query));
      } else {
        setJournalists(searchJournalists(query));
      }
      setIsLoading(false);
    }, 500);
  }, [query, activeTab]);
  
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };
  
  const renderEmptyState = () => {
    if (query.trim() === "") {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[typography.h3, styles.emptyTitle]}>
            Search for articles and journalists
          </Text>
          <Text style={[typography.body, styles.emptyText]}>
            Enter keywords to find articles, topics, or journalists
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={[typography.h3, styles.emptyTitle]}>
          No results found
        </Text>
        <Text style={[typography.body, styles.emptyText]}>
          Try different keywords or check your spelling
        </Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "articles" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("articles")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "articles" && styles.activeTabText,
            ]}
          >
            Articles
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "journalists" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("journalists")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "journalists" && styles.activeTabText,
            ]}
          >
            Journalists
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activeTab === "articles" ? (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ArticleCard article={item} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      ) : (
        <FlatList
          data={journalists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <JournalistCard journalist={item} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.card,
  },
  filterButton: {
    marginLeft: "auto",
    padding: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
