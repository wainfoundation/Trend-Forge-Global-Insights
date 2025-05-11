import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Switch, 
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/auth-store";
import { Bell, AlertTriangle, Info } from "lucide-react-native";

export default function NotificationSettingsScreen() {
  const { isAuthenticated, username } = useAuthStore();
  
  // Notification settings state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  
  // Push notification settings
  const [breakingNews, setBreakingNews] = useState(true);
  const [newArticles, setNewArticles] = useState(true);
  const [editorsPicks, setEditorsPicks] = useState(true);
  const [subscriptionAlerts, setSubscriptionAlerts] = useState(true);
  const [commentReplies, setCommentReplies] = useState(true);
  const [journalistUpdates, setJournalistUpdates] = useState(false);
  
  // Email notification settings
  const [weeklyNewsletter, setWeeklyNewsletter] = useState(true);
  const [subscriptionEmails, setSubscriptionEmails] = useState(true);
  const [specialOffers, setSpecialOffers] = useState(false);
  const [surveyInvites, setSurveyInvites] = useState(false);
  
  // Simulate loading notification settings
  useEffect(() => {
    if (isAuthenticated) {
      // Simulate API call to fetch notification settings
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  const handleSaveSettings = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to save your notification preferences."
      );
      return;
    }
    
    setSaving(true);
    
    // Simulate API call to save settings
    setTimeout(() => {
      setSaving(false);
      Alert.alert(
        "Settings Saved",
        "Your notification preferences have been updated successfully."
      );
    }, 1500);
  };
  
  const toggleAllPushNotifications = (value: boolean) => {
    setPushEnabled(value);
    if (!value) {
      // Turn off all push notifications
      setBreakingNews(false);
      setNewArticles(false);
      setEditorsPicks(false);
      setSubscriptionAlerts(false);
      setCommentReplies(false);
      setJournalistUpdates(false);
    } else {
      // Turn on essential push notifications
      setBreakingNews(true);
      setNewArticles(true);
      setSubscriptionAlerts(true);
    }
  };
  
  const toggleAllEmailNotifications = (value: boolean) => {
    setEmailEnabled(value);
    if (!value) {
      // Turn off all email notifications
      setWeeklyNewsletter(false);
      setSubscriptionEmails(false);
      setSpecialOffers(false);
      setSurveyInvites(false);
    } else {
      // Turn on essential email notifications
      setWeeklyNewsletter(true);
      setSubscriptionEmails(true);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading notification settings...</Text>
      </View>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <View style={styles.notAuthenticatedContainer}>
        <Bell size={64} color={colors.textSecondary} style={styles.notAuthenticatedIcon} />
        <Text style={styles.notAuthenticatedTitle}>Sign in to manage notifications</Text>
        <Text style={styles.notAuthenticatedText}>
          Sign in to customize your notification preferences and stay updated with the latest news and features.
        </Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>Notification Settings</Text>
        <Text style={styles.subtitle}>
          Customize how and when you receive notifications from Trend Forge.
        </Text>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <Switch
            value={pushEnabled}
            onValueChange={toggleAllPushNotifications}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        <Text style={styles.sectionDescription}>
          Receive notifications directly on your device.
        </Text>
        
        <View style={[styles.settingItem, !pushEnabled && styles.disabledSetting]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Breaking News</Text>
            <Text style={styles.settingDescription}>Important news alerts as they happen</Text>
          </View>
          <Switch
            value={breakingNews}
            onValueChange={setBreakingNews}
            disabled={!pushEnabled}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={[styles.settingItem, !pushEnabled && styles.disabledSetting]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>New Articles</Text>
            <Text style={styles.settingDescription}>Notifications for new articles in your favorite categories</Text>
          </View>
          <Switch
            value={newArticles}
            onValueChange={setNewArticles}
            disabled={!pushEnabled}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={[styles.settingItem, !pushEnabled && styles.disabledSetting]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Editor's Picks</Text>
            <Text style={styles.settingDescription}>Curated selections from our editorial team</Text>
          </View>
          <Switch
            value={editorsPicks}
            onValueChange={setEditorsPicks}
            disabled={!pushEnabled}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={[styles.settingItem, !pushEnabled && styles.disabledSetting]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Subscription Alerts</Text>
            <Text style={styles.settingDescription}>Renewal reminders and subscription updates</Text>
          </View>
          <Switch
            value={subscriptionAlerts}
            onValueChange={setSubscriptionAlerts}
            disabled={!pushEnabled}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={[styles.settingItem, !pushEnabled && styles.disabledSetting]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Comment Replies</Text>
            <Text style={styles.settingDescription}>When someone replies to your comments</Text>
          </View>
          <Switch
            value={commentReplies}
            onValueChange={setCommentReplies}
            disabled={!pushEnabled}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={[styles.settingItem, !pushEnabled && styles.disabledSetting, styles.lastItem]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Journalist Updates</Text>
            <Text style={styles.settingDescription}>New content from journalists you follow</Text>
          </View>
          <Switch
            value={journalistUpdates}
            onValueChange={setJournalistUpdates}
            disabled={!pushEnabled}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          <Switch
            value={emailEnabled}
            onValueChange={toggleAllEmailNotifications}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        <Text style={styles.sectionDescription}>
          Receive updates and newsletters via email.
        </Text>
        
        <View style={[styles.settingItem, !emailEnabled && styles.disabledSetting]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Weekly Newsletter</Text>
            <Text style={styles.settingDescription}>Weekly digest of top stories and features</Text>
          </View>
          <Switch
            value={weeklyNewsletter}
            onValueChange={setWeeklyNewsletter}
            disabled={!emailEnabled}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={[styles.settingItem, !emailEnabled && styles.disabledSetting]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Subscription Emails</Text>
            <Text style={styles.settingDescription}>Billing receipts and subscription information</Text>
          </View>
          <Switch
            value={subscriptionEmails}
            onValueChange={setSubscriptionEmails}
            disabled={!emailEnabled}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={[styles.settingItem, !emailEnabled && styles.disabledSetting]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Special Offers</Text>
            <Text style={styles.settingDescription}>Promotional offers and discounts</Text>
          </View>
          <Switch
            value={specialOffers}
            onValueChange={setSpecialOffers}
            disabled={!emailEnabled}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
        
        <View style={[styles.settingItem, !emailEnabled && styles.disabledSetting, styles.lastItem]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Survey Invites</Text>
            <Text style={styles.settingDescription}>Invitations to participate in reader surveys</Text>
          </View>
          <Switch
            value={surveyInvites}
            onValueChange={setSurveyInvites}
            disabled={!emailEnabled}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
      </View>
      
      <View style={styles.infoBox}>
        <Info size={20} color={colors.primary} style={styles.infoIcon} />
        <Text style={styles.infoText}>
          You can update your notification preferences at any time. Some service-related notifications may still be sent regardless of these settings.
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.savingButton]}
        onPress={handleSaveSettings}
        disabled={saving}
      >
        {saving ? (
          <>
            <ActivityIndicator size="small" color={colors.card} />
            <Text style={styles.saveButtonText}>Saving...</Text>
          </>
        ) : (
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 16,
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notAuthenticatedIcon: {
    marginBottom: 16,
  },
  notAuthenticatedTitle: {
    ...typography.h3,
    marginBottom: 8,
    textAlign: "center",
  },
  notAuthenticatedText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  header: {
    padding: 20,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.card,
    marginBottom: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: "600",
    fontSize: 18,
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lastItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  disabledSetting: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    ...typography.body,
    marginBottom: 4,
  },
  settingDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoBox: {
    backgroundColor: colors.primary + "10", // 10% opacity
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  savingButton: {
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
