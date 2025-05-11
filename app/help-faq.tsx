import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { ChevronDown, ChevronUp } from "lucide-react-native";

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpFAQScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const generalFAQs: FAQItem[] = [
    {
      question: "What is Trend Forge?",
      answer: "Trend Forge is a news platform powered by Pi Network that provides curated news and articles across various categories. Our platform connects readers with quality journalism while supporting content creators through the Pi cryptocurrency ecosystem."
    },
    {
      question: "How do I create an account?",
      answer: "You can create an account by clicking on the 'Sign In with Pi' button on the profile page. This will authenticate you through your Pi Network account, allowing you to access personalized features and premium content."
    },
    {
      question: "Is Trend Forge available on all devices?",
      answer: "Yes, Trend Forge is available as a mobile app for iOS and Android devices, and can also be accessed through our web platform at www.trendforge.com."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team through the 'Contact Us' page in the app, or by emailing support@trendforge.com. We aim to respond to all inquiries within 24 hours."
    }
  ];

  const subscriptionFAQs: FAQItem[] = [
    {
      question: "What subscription plans are available?",
      answer: "We offer three subscription tiers: Free (limited to 3 articles per day), Basic (ad-free reading with unlimited articles), and Premium (all Basic features plus exclusive content and early access to new features)."
    },
    {
      question: "How do I upgrade my subscription?",
      answer: "You can upgrade your subscription by navigating to the 'Subscription' section in your profile or by clicking on the 'Upgrade Now' button when you reach your article limit."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time through the 'Subscription' section in your profile. Your access will continue until the end of your current billing period."
    },
    {
      question: "Will I be charged automatically when my subscription renews?",
      answer: "Yes, subscriptions automatically renew at the end of each billing period. You will receive a notification before the renewal date, and you can cancel anytime before then to avoid charges."
    }
  ];

  const contentFAQs: FAQItem[] = [
    {
      question: "How often is content updated?",
      answer: "Our platform is updated with new articles throughout the day. Breaking news is published as events unfold, while feature articles and in-depth analysis are published on a regular schedule."
    },
    {
      question: "Can I save articles to read later?",
      answer: "Yes, you can bookmark articles to read later by tapping the bookmark icon on any article. Your saved articles can be accessed from the 'Bookmarks' section in your profile."
    },
    {
      question: "How do I report inaccurate or inappropriate content?",
      answer: "Each article has a 'Report' option in the menu. You can use this to flag content that you believe is inaccurate, inappropriate, or violates our community guidelines."
    },
    {
      question: "Can I share articles with friends?",
      answer: "Yes, you can share any article by tapping the share icon. This allows you to share via social media, messaging apps, or email."
    }
  ];

  const piNetworkFAQs: FAQItem[] = [
    {
      question: "How is Trend Forge integrated with Pi Network?",
      answer: "Trend Forge uses Pi Network for authentication and payments. You can sign in with your Pi account and use Pi cryptocurrency to purchase subscriptions or tip content creators."
    },
    {
      question: "Do I need Pi coins to use Trend Forge?",
      answer: "No, you can use Trend Forge with the free plan without any Pi coins. However, Pi coins are required for premium subscriptions and tipping journalists."
    },
    {
      question: "How do journalists earn Pi through Trend Forge?",
      answer: "Journalists earn Pi through a combination of subscription revenue sharing, direct tips from readers, and bonuses for high-performing content."
    },
    {
      question: "Is my Pi wallet information secure?",
      answer: "Yes, we use industry-standard encryption and security practices to protect all user data, including Pi wallet information. We never store your private keys."
    }
  ];

  const renderFAQSection = (title: string, items: FAQItem[], startIndex: number) => (
    <View style={styles.section}>
      <Text style={[typography.h2, styles.sectionTitle]}>{title}</Text>
      {items.map((item, index) => {
        const actualIndex = startIndex + index;
        return (
          <View key={actualIndex} style={styles.faqItem}>
            <TouchableOpacity 
              style={styles.questionContainer} 
              onPress={() => toggleExpand(actualIndex)}
            >
              <Text style={styles.question}>{item.question}</Text>
              {expandedIndex === actualIndex ? (
                <ChevronUp size={20} color={colors.primary} />
              ) : (
                <ChevronDown size={20} color={colors.text} />
              )}
            </TouchableOpacity>
            {expandedIndex === actualIndex && (
              <Text style={styles.answer}>{item.answer}</Text>
            )}
          </View>
        );
      })}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h1, styles.title]}>Help & Frequently Asked Questions</Text>
        <Text style={styles.subtitle}>
          Find answers to common questions about Trend Forge. If you can't find what you're looking for, please contact our support team.
        </Text>
      </View>

      {renderFAQSection("General Questions", generalFAQs, 0)}
      {renderFAQSection("Subscription & Billing", subscriptionFAQs, generalFAQs.length)}
      {renderFAQSection("Content & Features", contentFAQs, generalFAQs.length + subscriptionFAQs.length)}
      {renderFAQSection("Pi Network Integration", piNetworkFAQs, generalFAQs.length + subscriptionFAQs.length + contentFAQs.length)}

      <View style={styles.contactSection}>
        <Text style={[typography.h3, styles.contactTitle]}>Still have questions?</Text>
        <Text style={styles.contactText}>
          Our support team is here to help. Contact us through our support channels and we'll get back to you as soon as possible.
        </Text>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => router.push("/contact-us")}
        >
          <Text style={styles.contactButtonText}>Contact Support</Text>
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
    padding: 20,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.card,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  question: {
    ...typography.body,
    fontWeight: "600",
    flex: 1,
    paddingRight: 8,
  },
  answer: {
    ...typography.body,
    color: colors.textSecondary,
    paddingVertical: 8,
  },
  contactSection: {
    backgroundColor: colors.card,
    padding: 20,
    marginBottom: 32,
    alignItems: "center",
  },
  contactTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  contactText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  contactButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
});
