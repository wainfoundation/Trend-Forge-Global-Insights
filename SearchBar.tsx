import React, { useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { Search, X } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search...", initialValue = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  
  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };
  
  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.text} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.text}
          value={searchQuery}
          onChangeText={handleChangeText}
          returnKeyType="search"
          onSubmitEditing={() => onSearch(searchQuery)}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <X size={18} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: "100%",
  },
  clearButton: {
    padding: 4,
  },
});
