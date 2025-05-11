import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/auth-store";
import AuthModal from "@/components/AuthModal";
import { Edit3, FileText, DollarSign, Award, ChevronRight } from "lucide-react-native";

export default function JournalistProgramScreen() {
  const router = useRouter();
  const { isAuthenticated, username } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [expertise, setExpertise] = useState("");
  const [experience, setExperience] = useState("");
  const [sampleWork, setSampleWork] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!name || !email || !expertise || !experience || !sampleWork) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Application Submitted",
        "Thank you for your application! We'll review it and get back to you soon.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Stack.Screen options={{ title: "Journalist Program" }} />
        <Text style={[typography.h2, styles.authTitle]}>Sign In Required</Text>
        <Text style={[typography.body, styles.authText]}>
          Please sign in with your Pi account to apply for the journalist program.
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => setShowAuthModal(true)}
        >
          <Text style={styles.authButtonText}>Sign In with Pi</Text>
        </TouchableOpacity>
        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: "Journalist Program" }} />
      
      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>Become a Trend Forge Journalist</Text>
        <Text style={styles.subtitle}>
          Share your expertise and earn Pi by contributing quality content
        </Text>
      </View>

      <View style={styles.benefitsContainer}>
        <Text style={[typography.h3, styles.benefitsTitle]}>Benefits</Text>
        
        <View style={styles.benefitItem}>
          <DollarSign size={24} color={colors.primary} style={styles.benefitIcon} />
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Earn Pi for Your Content</Text>
            <Text style={styles.benefitText}>
              Receive monthly Pi payments for your published articles
            </Text>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <Award size={24} color={colors.primary} style={styles.benefitIcon} />
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Official Journalist Badge</Text>
            <Text style={styles.benefitText}>
              Get recognized with a verified journalist profile
            </Text>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <FileText size={24} color={colors.primary} style={styles.benefitIcon} />
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Professional Platform</Text>
            <Text style={styles.benefitText}>
              Showcase your work to thousands of readers
            </Text>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <Edit3 size={24} color={colors.primary} style={styles.benefitIcon} />
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Editorial Support</Text>
            <Text style={styles.benefitText}>
              Work with our editors to refine your content
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={[typography.h3, styles.formTitle]}>Application Form</Text>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Pi Username</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={username || ""}
            editable={false}
          />
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Areas of Expertise</Text>
          <TextInput
            style={styles.input}
            value={expertise}
            onChangeText={setExpertise}
            placeholder="e.g., Finance, Technology, Pi Network"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Writing Experience</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={experience}
            onChangeText={setExperience}
            placeholder="Describe your writing experience"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={Platform.OS === 'ios' ? 0 : 4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.formField}>
          <Text style={styles.label}>Sample Work or Portfolio Link</Text>
          <TextInput
            style={styles.input}
            value={sampleWork}
            onChangeText={setSampleWork}
            placeholder="Enter URL or describe previous work"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />
        </View>
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submittingButton
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.faqContainer}>
        <Text style={[typography.h3, styles.faqTitle]}>Frequently Asked Questions</Text>
        
        <TouchableOpacity style={styles.faqItem}>
          <View style={styles.faqQuestion}>
            <Text style={styles.faqQuestionText}>How much Pi can I earn?</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.faqAnswer}>
            Journalists earn 5-20 Pi per article depending on quality, engagement, and experience level.
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.faqItem}>
          <View style={styles.faqQuestion}>
            <Text style={styles.faqQuestionText}>How often can I publish?</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.faqAnswer}>
            You can publish 1-4 articles per month based on your journalist level and our editorial needs.
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.faqItem}>
          <View style={styles.faqQuestion}>
            <Text style={styles.faqQuestionText}>What topics can I write about?</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.faqAnswer}>
            We accept content related to business, finance, technology, culture, and Pi Network ecosystem.
          </Text>
        </TouchableOpacity>
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
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  authTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  authText: {
    textAlign: "center",
    marginBottom: 24,
    color: colors.textSecondary,
  },
  authButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  authButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
  benefitsContainer: {
    padding: 16,
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefitsTitle: {
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  benefitIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  benefitText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  formContainer: {
    padding: 16,
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  disabledInput: {
    backgroundColor: colors.inactive + "30",
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submittingButton: {
    backgroundColor: colors.primary + "80",
  },
  submitButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
  faqContainer: {
    padding: 16,
    backgroundColor: colors.card,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32,
  },
  faqTitle: {
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  faqQuestionText: {
    ...typography.body,
    fontWeight: "600",
  },
  faqAnswer: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
