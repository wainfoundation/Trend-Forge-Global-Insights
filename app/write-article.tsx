import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/auth-store";
import * as ImagePicker from "expo-image-picker";
import {
  Image as ImageIcon,
  Save,
  Send,
  X,
  ChevronDown,
  Tag,
} from "lucide-react-native";
import { categories } from "@/mocks/categories";
import { ArticleDraft, ArticleStatus } from "@/types/article-draft";
import { createArticle, updateArticle, getArticleById, uploadFile } from "@/utils/firebase";

export default function WriteArticleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isJournalist, username } = useAuthStore();
  const [article, setArticle] = useState<ArticleDraft>({
    title: "",
    summary: "",
    content: "",
    category: "",
    isPremium: false,
    status: "draft",
    authorId: "current-user-id",
    authorName: username || "Current User",
    tags: [],
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: undefined
  });
  const [image, setImage] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Check if user is journalist
  if (!isJournalist) {
    router.replace("/unauthorized");
    return null;
  }

  // Check if we're in edit mode
  useEffect(() => {
    if (params.id) {
      setIsEditMode(true);
      fetchArticle(params.id as string);
    }
  }, [params.id]);

  const fetchArticle = async (id: string) => {
    try {
      // In a real app, fetch from Firebase
      // const articleData = await getArticleById(id);
      // setArticle(articleData);
      // if (articleData.imageUrl) {
      //   setImage(articleData.imageUrl);
      // }
      
      // For now, use mock data
      const mockArticle: ArticleDraft = {
        id: id,
        title: "How Pi Network is Revolutionizing Cryptocurrency",
        summary: "An in-depth analysis of Pi Network's unique approach to cryptocurrency and its potential impact on the global economy.",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.",
        category: "Technology",
        isPremium: true,
        status: "published",
        authorId: "current-user-id",
        authorName: username || "Current User",
        tags: ["cryptocurrency", "pi network", "blockchain"],
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80"
      };
      
      setArticle(mockArticle);
      if (mockArticle.imageUrl) {
        setImage(mockArticle.imageUrl);
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      Alert.alert("Error", "Failed to load article");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      updateArticleState("imageUrl", result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImage(null);
    updateArticleState("imageUrl", undefined);
  };

  const handleSaveDraft = async () => {
    if (!article.title) {
      Alert.alert("Error", "Please enter a title for your article");
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, save to Firebase
      // const updatedArticle = {
      //   ...article,
      //   status: "draft",
      //   updatedAt: new Date().toISOString()
      // };
      
      // if (isEditMode && article.id) {
      //   await updateArticle(article.id, updatedArticle);
      // } else {
      //   const newId = await createArticle(updatedArticle);
      //   setArticle(prev => ({ ...prev, id: newId }));
      // }
      
      // Simulate API call
      setTimeout(() => {
        setIsSaving(false);
        Alert.alert(
          "Success",
          "Your article has been saved as a draft",
          [
            {
              text: "OK",
              onPress: () => router.push("/my-articles"),
            },
          ]
        );
      }, 1000);
    } catch (error) {
      console.error("Error saving draft:", error);
      Alert.alert("Error", "Failed to save draft");
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!article.title || !article.summary || !article.content || !article.category) {
      Alert.alert(
        "Error",
        "Please fill in all required fields (title, summary, content, category)"
      );
      return;
    }

    if (!image) {
      Alert.alert("Error", "Please add a cover image for your article");
      return;
    }

    setIsPublishing(true);
    try {
      // In a real app, save to Firebase
      // const updatedArticle = {
      //   ...article,
      //   status: "pending",
      //   updatedAt: new Date().toISOString()
      // };
      
      // if (isEditMode && article.id) {
      //   await updateArticle(article.id, updatedArticle);
      // } else {
      //   const newId = await createArticle(updatedArticle);
      //   setArticle(prev => ({ ...prev, id: newId }));
      // }
      
      // Simulate API call
      setTimeout(() => {
        setIsPublishing(false);
        Alert.alert(
          "Success",
          "Your article has been submitted for review",
          [
            {
              text: "OK",
              onPress: () => router.push("/my-articles"),
            },
          ]
        );
      }, 1500);
    } catch (error) {
      console.error("Error publishing article:", error);
      Alert.alert("Error", "Failed to submit article");
      setIsPublishing(false);
    }
  };

  const updateArticleState = (field: keyof ArticleDraft, value: any) => {
    setArticle(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ title: isEditMode ? "Edit Article" : "Write Article" }} />

        <View style={styles.header}>
          <Text style={[typography.h2, styles.title]}>
            {isEditMode ? "Edit Article" : "Write New Article"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditMode 
              ? "Update your content on Trend Forge" 
              : "Create and publish your content to Trend Forge"}
          </Text>
        </View>

        <View style={styles.form}>
          {/* Title */}
          <View style={styles.formField}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={article.title}
              onChangeText={(text) => updateArticleState("title", text)}
              placeholder="Enter article title"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Summary */}
          <View style={styles.formField}>
            <Text style={styles.label}>Summary *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={article.summary}
              onChangeText={(text) => updateArticleState("summary", text)}
              placeholder="Write a brief summary (1-2 sentences)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={Platform.OS === "ios" ? undefined : 3}
              textAlignVertical="top"
            />
          </View>

          {/* Cover Image */}
          <View style={styles.formField}>
            <Text style={styles.label}>Cover Image *</Text>
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}
                >
                  <X size={16} color={colors.card} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickImage}
              >
                <ImageIcon size={24} color={colors.primary} />
                <Text style={styles.imagePickerText}>Select Cover Image</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category */}
          <View style={styles.formField}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text
                style={
                  article.category
                    ? styles.dropdownSelectedText
                    : styles.dropdownPlaceholder
                }
              >
                {article.category || "Select a category"}
              </Text>
              <ChevronDown
                size={20}
                color={colors.textSecondary}
                style={{
                  transform: [
                    { rotate: showCategoryDropdown ? "180deg" : "0deg" },
                  ],
                }}
              />
            </TouchableOpacity>
            {showCategoryDropdown && (
              <View style={styles.dropdownMenu}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.dropdownItem,
                      article.category === cat.name && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      updateArticleState("category", cat.name);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        article.category === cat.name && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Premium Toggle */}
          <View style={styles.formField}>
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Premium Content</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  article.isPremium && styles.toggleButtonActive,
                ]}
                onPress={() => updateArticleState("isPremium", !article.isPremium)}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    article.isPremium && styles.toggleKnobActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.toggleDescription}>
              Mark this article as premium content (subscribers only)
            </Text>
          </View>

          {/* Content */}
          <View style={styles.formField}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.input, styles.contentArea]}
              value={article.content}
              onChangeText={(text) => updateArticleState("content", text)}
              placeholder="Write your article content here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={Platform.OS === "ios" ? undefined : 10}
              textAlignVertical="top"
            />
          </View>

          {/* Tags */}
          <View style={styles.formField}>
            <Text style={styles.label}>Tags (Optional)</Text>
            <View style={styles.tagsContainer}>
              <View style={styles.tagInputContainer}>
                <Tag size={16} color={colors.textSecondary} />
                <TextInput
                  style={styles.tagInput}
                  placeholder="Add tags separated by commas"
                  placeholderTextColor={colors.textSecondary}
                  value={article.tags.join(", ")}
                  onChangeText={(text) => {
                    const tags = text.split(",").map(tag => tag.trim()).filter(tag => tag);
                    updateArticleState("tags", tags);
                  }}
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSaveDraft}
              disabled={isSaving || isPublishing}
            >
              <Save size={16} color={colors.text} />
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : "Save Draft"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.publishButton]}
              onPress={handlePublish}
              disabled={isSaving || isPublishing}
            >
              <Send size={16} color={colors.card} />
              <Text style={styles.publishButtonText}>
                {isPublishing ? "Submitting..." : "Submit for Review"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.primary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  form: {
    padding: 16,
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  contentArea: {
    minHeight: 200,
    textAlignVertical: "top",
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    borderStyle: "dashed",
  },
  imagePickerText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 8,
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  dropdownPlaceholder: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  dropdownSelectedText: {
    color: colors.text,
    fontSize: 16,
  },
  dropdownMenu: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primary + "20", // 20% opacity
  },
  dropdownItemText: {
    ...typography.body,
    color: colors.text,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.inactive || "#d1d5db",
    padding: 2,
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  toggleDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tagsContainer: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  saveButtonText: {
    ...typography.body,
    fontWeight: "500",
    marginLeft: 8,
  },
  publishButton: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  publishButtonText: {
    ...typography.body,
    color: colors.card,
    fontWeight: "500",
    marginLeft: 8,
  },
});
