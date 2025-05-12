import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { categories } from "@/mocks/categories";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { BookOpen, Briefcase, Globe, LineChart, Microscope, Music } from "lucide-react-native";

interface CategoryListProps {
  onSelectCategory: (category: string) => void;
  selectedCategory?: string;
}

export default function CategoryList({ onSelectCategory, selectedCategory }: CategoryListProps) {
  const getIcon = (iconName: string, isSelected: boolean) => {
    const color = isSelected ? colors.card : colors.text;
    const size = 20;
    
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
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        style={[
          styles.categoryItem,
          !selectedCategory && styles.selectedCategory,
        ]}
        onPress={() => onSelectCategory("")}
      >
        <Text
          style={[
            styles.categoryText,
            !selectedCategory && styles.selectedCategoryText,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      
      {categories.map((category) => {
        const isSelected = selectedCategory === category.name;
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              isSelected && styles.selectedCategory,
            ]}
            onPress={() => onSelectCategory(category.name)}
          >
            {getIcon(category.iconName || "", isSelected)}
            <Text
              style={[
                styles.categoryText,
                isSelected && styles.selectedCategoryText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    gap: 6,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.bodySmall,
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: colors.card,
  },
});
