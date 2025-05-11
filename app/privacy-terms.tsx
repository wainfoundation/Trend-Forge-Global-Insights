import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

export default function PrivacyTermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h1, styles.title]}>Privacy Policy & Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: June 15, 2023</Text>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>Privacy Policy</Text>
        
        <Text style={[typography.h3, styles.subsectionTitle]}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          At Trend Forge, we collect various types of information to provide and improve our services:
        </Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Account Information:</Text> When you create an account, we collect your Pi Network username and wallet address.</Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Usage Data:</Text> We collect information about how you interact with our app, including articles you read, searches you perform, and features you use.</Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Device Information:</Text> We collect information about your device, including device type, operating system, and unique device identifiers.</Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Location Information:</Text> With your permission, we may collect and process information about your location to provide location-based services.</Text>

        <Text style={[typography.h3, styles.subsectionTitle]}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect for various purposes:
        </Text>
        <Text style={styles.bulletPoint}>• To provide, maintain, and improve our services</Text>
        <Text style={styles.bulletPoint}>• To personalize your experience and deliver content relevant to your interests</Text>
        <Text style={styles.bulletPoint}>• To process transactions and manage your subscription</Text>
        <Text style={styles.bulletPoint}>• To communicate with you about updates, offers, and other information</Text>
        <Text style={styles.bulletPoint}>• To detect, prevent, and address technical issues and security threats</Text>

        <Text style={[typography.h3, styles.subsectionTitle]}>3. Data Sharing and Disclosure</Text>
        <Text style={styles.paragraph}>
          We may share your information in the following circumstances:
        </Text>
        <Text style={styles.bulletPoint}>• With service providers who perform services on our behalf</Text>
        <Text style={styles.bulletPoint}>• With Pi Network for authentication and payment processing</Text>
        <Text style={styles.bulletPoint}>• When required by law or to protect our rights</Text>
        <Text style={styles.bulletPoint}>• In connection with a business transfer or acquisition</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal information to third parties.
        </Text>

        <Text style={[typography.h3, styles.subsectionTitle]}>4. Your Rights and Choices</Text>
        <Text style={styles.paragraph}>
          You have several rights regarding your personal information:
        </Text>
        <Text style={styles.bulletPoint}>• Access and update your information through your account settings</Text>
        <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>
        <Text style={styles.bulletPoint}>• Request deletion of your account and associated data</Text>
        <Text style={styles.bulletPoint}>• Control app permissions such as location access</Text>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>Terms of Service</Text>
        
        <Text style={[typography.h3, styles.subsectionTitle]}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using Trend Forge, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
        </Text>

        <Text style={[typography.h3, styles.subsectionTitle]}>2. User Accounts</Text>
        <Text style={styles.paragraph}>
          To access certain features of our service, you must create an account using your Pi Network credentials. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
        </Text>

        <Text style={[typography.h3, styles.subsectionTitle]}>3. Subscription and Payments</Text>
        <Text style={styles.paragraph}>
          Trend Forge offers various subscription plans. By subscribing to a paid plan, you agree to the following:
        </Text>
        <Text style={styles.bulletPoint}>• Payment will be charged to your Pi wallet at confirmation of purchase</Text>
        <Text style={styles.bulletPoint}>• Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period</Text>
        <Text style={styles.bulletPoint}>• You can manage your subscription and turn off auto-renewal in your account settings</Text>
        <Text style={styles.bulletPoint}>• No refunds will be provided for the current subscription period</Text>

        <Text style={[typography.h3, styles.subsectionTitle]}>4. Content and Conduct</Text>
        <Text style={styles.paragraph}>
          When using our service, you agree not to:
        </Text>
        <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>
        <Text style={styles.bulletPoint}>• Infringe upon the rights of others</Text>
        <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to any part of the service</Text>
        <Text style={styles.bulletPoint}>• Use the service for any illegal or unauthorized purpose</Text>
        <Text style={styles.bulletPoint}>• Interfere with or disrupt the service or servers</Text>

        <Text style={[typography.h3, styles.subsectionTitle]}>5. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content, features, and functionality of the Trend Forge app, including but not limited to text, graphics, logos, and software, are owned by Trend Forge or its licensors and are protected by copyright, trademark, and other intellectual property laws.
        </Text>

        <Text style={[typography.h3, styles.subsectionTitle]}>6. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, Trend Forge shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or in connection with your use of the service.
        </Text>

        <Text style={[typography.h3, styles.subsectionTitle]}>7. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may modify these Terms of Service at any time. We will notify you of any material changes through the app or via email. Your continued use of the service after such modifications constitutes your acceptance of the updated terms.
        </Text>

        <Text style={[typography.h3, styles.subsectionTitle]}>8. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms of Service shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          If you have any questions about our Privacy Policy or Terms of Service, please contact us at legal@trendforge.com.
        </Text>
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
    marginBottom: 8,
  },
  lastUpdated: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.card,
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  subsectionTitle: {
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    ...typography.body,
    marginBottom: 12,
  },
  bulletPoint: {
    ...typography.body,
    marginBottom: 8,
    paddingLeft: 16,
  },
  bold: {
    fontWeight: "600",
  },
  footer: {
    backgroundColor: colors.card,
    padding: 20,
    marginBottom: 32,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
