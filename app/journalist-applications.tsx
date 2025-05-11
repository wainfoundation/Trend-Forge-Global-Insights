import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/auth-store";
import { Check, X, ChevronRight, User, FileText, Mail } from "lucide-react-native";
import { JournalistApplication } from "@/types/journalist";

// Mock journalist applications
const mockApplications: JournalistApplication[] = [
  {
    id: "app1",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    username: "sarahjohnson",
    expertise: ["Technology", "Business", "Startups"],
    experience: "5 years of experience writing for tech blogs and business magazines.",
    sampleWork: "https://example.com/portfolio/sarah",
    status: "pending",
    submittedAt: "2023-06-10T14:30:00Z",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
  },
  {
    id: "app2",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    username: "michaelchen",
    expertise: ["Finance", "Economics", "Markets"],
    experience: "Former financial analyst with 3 years of writing experience.",
    sampleWork: "https://example.com/portfolio/michael",
    status: "pending",
    submittedAt: "2023-06-12T09:15:00Z",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
  },
  {
    id: "app3",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@example.com",
    username: "emmarodriguez",
    expertise: ["Culture", "Art", "Digital Media"],
    experience: "Freelance writer for 4 years, specializing in cultural topics.",
    sampleWork: "https://example.com/portfolio/emma",
    status: "pending",
    submittedAt: "2023-06-14T16:45:00Z",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80",
  },
];

export default function JournalistApplicationsScreen() {
  const router = useRouter();
  const { isAdmin } = useAuthStore();
  const [applications, setApplications] = useState<JournalistApplication[]>(mockApplications);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("pending");

  // Check if user is admin
  if (!isAdmin) {
    router.replace("/admin");
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleApprove = (id: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setApplications(
        applications.map((app) =>
          app.id === id ? { ...app, status: "approved" } : app
        )
      );
      setLoading(false);
    }, 1000);
  };

  const handleReject = (id: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setApplications(
        applications.map((app) =>
          app.id === id ? { ...app, status: "rejected" } : app
        )
      );
      setLoading(false);
    }, 1000);
  };

  const filteredApplications = applications.filter(
    (app) => app.status === selectedTab
  );

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: "Journalist Applications" }} />

      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>Journalist Applications</Text>
        <Text style={styles.subtitle}>
          Review and manage journalist applications
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "pending" && styles.activeTab]}
          onPress={() => setSelectedTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "pending" && styles.activeTabText,
            ]}
          >
            Pending ({applications.filter((app) => app.status === "pending").length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "approved" && styles.activeTab]}
          onPress={() => setSelectedTab("approved")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "approved" && styles.activeTabText,
            ]}
          >
            Approved
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "rejected" && styles.activeTab]}
          onPress={() => setSelectedTab("rejected")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "rejected" && styles.activeTabText,
            ]}
          >
            Rejected
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      ) : filteredApplications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No {selectedTab} applications found.
          </Text>
        </View>
      ) : (
        <View style={styles.applicationsContainer}>
          {filteredApplications.map((application) => (
            <View key={application.id} style={styles.applicationCard}>
              <View style={styles.applicationHeader}>
                <Image
                  source={{ uri: application.avatarUrl }}
                  style={styles.avatar}
                />
                <View style={styles.applicationInfo}>
                  <Text style={styles.applicantName}>{application.name}</Text>
                  <Text style={styles.applicationDate}>
                    Applied on {formatDate(application.submittedAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <User size={16} color={colors.textSecondary} />
                  <Text style={styles.detailLabel}>Username:</Text>
                  <Text style={styles.detailValue}>{application.username}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Mail size={16} color={colors.textSecondary} />
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{application.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <FileText size={16} color={colors.textSecondary} />
                  <Text style={styles.detailLabel}>Expertise:</Text>
                  <Text style={styles.detailValue}>
                    {application.expertise.join(", ")}
                  </Text>
                </View>
              </View>

              <View style={styles.experienceContainer}>
                <Text style={styles.experienceLabel}>Experience:</Text>
                <Text style={styles.experienceText}>
                  {application.experience}
                </Text>
              </View>

              <View style={styles.sampleWorkContainer}>
                <Text style={styles.sampleWorkLabel}>Sample Work:</Text>
                <TouchableOpacity>
                  <Text style={styles.sampleWorkLink}>
                    {application.sampleWork}
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedTab === "pending" && (
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(application.id)}
                  >
                    <Check size={16} color={colors.card} />
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(application.id)}
                  >
                    <X size={16} color={colors.card} />
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedTab === "approved" && (
                <View style={styles.statusContainer}>
                  <Text style={[styles.statusText, styles.approvedText]}>
                    Approved
                  </Text>
                  <TouchableOpacity style={styles.manageButton}>
                    <Text style={styles.manageButtonText}>Manage Journalist</Text>
                    <ChevronRight size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              )}

              {selectedTab === "rejected" && (
                <View style={styles.statusContainer}>
                  <Text style={[styles.statusText, styles.rejectedText]}>
                    Rejected
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
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
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
    padding: 8,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 4,
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
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  applicationsContainer: {
    padding: 16,
  },
  applicationCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  applicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  applicationInfo: {
    flex: 1,
  },
  applicantName: {
    ...typography.h4,
    marginBottom: 4,
  },
  applicationDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailsContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    ...typography.bodySmall,
    fontWeight: "500",
    marginLeft: 8,
    marginRight: 4,
    width: 80,
  },
  detailValue: {
    ...typography.bodySmall,
    flex: 1,
  },
  experienceContainer: {
    marginBottom: 16,
  },
  experienceLabel: {
    ...typography.bodySmall,
    fontWeight: "500",
    marginBottom: 4,
  },
  experienceText: {
    ...typography.body,
  },
  sampleWorkContainer: {
    marginBottom: 16,
  },
  sampleWorkLabel: {
    ...typography.bodySmall,
    fontWeight: "500",
    marginBottom: 4,
  },
  sampleWorkLink: {
    ...typography.body,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: "#10b981", // green
  },
  rejectButton: {
    backgroundColor: "#ef4444", // red
  },
  actionButtonText: {
    color: colors.card,
    fontWeight: "500",
    marginLeft: 8,
  },
  statusContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  statusText: {
    ...typography.body,
    fontWeight: "500",
    marginBottom: 8,
  },
  approvedText: {
    color: "#10b981", // green
  },
  rejectedText: {
    color: "#ef4444", // red
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  manageButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "500",
    marginRight: 4,
  },
});
