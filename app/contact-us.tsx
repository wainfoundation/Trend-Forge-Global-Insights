import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Mail, Phone, MapPin, Send, AlertCircle } from "lucide-react-native";

export default function ContactUsScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = () => {
    // Validate form
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!subject.trim()) {
      Alert.alert("Error", "Please enter a subject");
      return;
    }

    if (!message.trim()) {
      Alert.alert("Error", "Please enter your message");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Message Sent",
        "Thank you for contacting us. We will get back to you as soon as possible.",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setName("");
              setEmail("");
              setSubject("");
              setMessage("");
            },
          },
        ]
      );
    }, 1500);
  };

  const openMap = () => {
    const address = "123 News Street, San Francisco, CA 94103";
    const encodedAddress = encodeURIComponent(address);
    
    const url = Platform.select({
      ios: `maps:0,0?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
      default: `https://maps.google.com/?q=${encodedAddress}`
    });

    Linking.openURL(url).catch(err => {
      console.error("Failed to open map:", err);
      Alert.alert("Error", "Could not open map. Please try again later.");
    });
  };

  const callPhone = () => {
    Linking.openURL("tel:+14155552671").catch(err => {
      console.error("Failed to open phone:", err);
      Alert.alert("Error", "Could not open phone. Please try again later.");
    });
  };

  const sendEmail = () => {
    Linking.openURL("mailto:contact@trendforge.com").catch(err => {
      console.error("Failed to open email:", err);
      Alert.alert("Error", "Could not open email. Please try again later.");
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h1, styles.title]}>Contact Us</Text>
          <Text style={styles.subtitle}>
            Have questions, feedback, or need assistance? We're here to help. Reach out to our team using any of the methods below.
          </Text>
        </View>

        <View style={styles.contactInfoSection}>
          <View style={styles.contactInfoItem}>
            <View style={styles.iconContainer}>
              <Mail size={24} color={colors.primary} />
            </View>
            <View style={styles.contactInfoContent}>
              <Text style={styles.contactInfoTitle}>Email Us</Text>
              <Text style={styles.contactInfoText}>contact@trendforge.com</Text>
              <TouchableOpacity onPress={sendEmail}>
                <Text style={styles.contactInfoLink}>Send an email</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.contactInfoItem}>
            <View style={styles.iconContainer}>
              <Phone size={24} color={colors.primary} />
            </View>
            <View style={styles.contactInfoContent}>
              <Text style={styles.contactInfoTitle}>Call Us</Text>
              <Text style={styles.contactInfoText}>+1 (415) 555-2671</Text>
              <TouchableOpacity onPress={callPhone}>
                <Text style={styles.contactInfoLink}>Make a call</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.contactInfoItem}>
            <View style={styles.iconContainer}>
              <MapPin size={24} color={colors.primary} />
            </View>
            <View style={styles.contactInfoContent}>
              <Text style={styles.contactInfoTitle}>Visit Us</Text>
              <Text style={styles.contactInfoText}>123 News Street, San Francisco, CA 94103</Text>
              <TouchableOpacity onPress={openMap}>
                <Text style={styles.contactInfoLink}>View on map</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={[typography.h2, styles.formTitle]}>Send Us a Message</Text>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Your Name</Text>
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
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="What is this regarding?"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={styles.textArea}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Sending...</Text>
            ) : (
              <>
                <Send size={18} color={colors.card} />
                <Text style={styles.submitButtonText}>Send Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.supportNote}>
          <AlertCircle size={20} color={colors.primary} style={styles.supportNoteIcon} />
          <Text style={styles.supportNoteText}>
            For urgent matters related to your subscription or account, please contact our support team directly at support@trendforge.com or call our dedicated support line at +1 (415) 555-9876.
          </Text>
        </View>

        <View style={styles.businessHours}>
          <Text style={styles.businessHoursTitle}>Business Hours</Text>
          <Text style={styles.businessHoursText}>Monday - Friday: 9:00 AM - 6:00 PM PST</Text>
          <Text style={styles.businessHoursText}>Saturday: 10:00 AM - 4:00 PM PST</Text>
          <Text style={styles.businessHoursText}>Sunday: Closed</Text>
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
  contactInfoSection: {
    backgroundColor: colors.card,
    marginBottom: 16,
    padding: 16,
  },
  contactInfoItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactInfoContent: {
    flex: 1,
  },
  contactInfoTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  contactInfoText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  contactInfoLink: {
    ...typography.body,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  formSection: {
    backgroundColor: colors.card,
    marginBottom: 16,
    padding: 20,
  },
  formTitle: {
    marginBottom: 20,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.inactive,
  },
  submitButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  supportNote: {
    backgroundColor: colors.card,
    marginBottom: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  supportNoteIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  supportNoteText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  businessHours: {
    backgroundColor: colors.card,
    marginBottom: 32,
    padding: 16,
  },
  businessHoursTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 8,
  },
  businessHoursText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
