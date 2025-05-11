import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useTaskStore } from "@/store/task-store";
import { useAuthStore } from "@/store/auth-store";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Send,
  DollarSign,
  User,
  Tag,
} from "lucide-react-native";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTask, updateTaskStatus, submitTask, isLoading } = useTaskStore();
  const { isJournalist, isAdmin } = useAuthStore();
  const [task, setTask] = useState(getTask(id));
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!task) {
      Alert.alert("Error", "Task not found");
      router.back();
    }
  }, [task]);

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981"; // green
      case "pending":
        return "#f59e0b"; // amber
      case "overdue":
        return "#ef4444"; // red
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} color={getStatusColor(status)} />;
      case "pending":
        return <Clock size={20} color={getStatusColor(status)} />;
      case "overdue":
        return <AlertCircle size={20} color={getStatusColor(status)} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmitTask = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please enter your article content");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTask(task.id, content);
      Alert.alert(
        "Success",
        "Your article has been submitted for review",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveTask = async () => {
    if (!feedback.trim() && isAdmin) {
      Alert.alert("Error", "Please provide feedback before approving");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTaskStatus(task.id, "completed", new Date().toISOString());
      Alert.alert(
        "Success",
        "Task has been approved",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to approve task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectTask = async () => {
    if (!feedback.trim()) {
      Alert.alert("Error", "Please provide feedback before rejecting");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTaskStatus(task.id, "pending");
      Alert.alert(
        "Success",
        "Task has been returned for revision",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to reject task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ title: "Task Details" }} />

        <View style={styles.header}>
          <Text style={styles.title}>{task.title}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(task.status) + "20" },
              ]}
            >
              {getStatusIcon(task.status)}
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(task.status) },
                ]}
              >
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Text>
            </View>
            {task.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Deadline:</Text>
            <Text style={styles.detailValue}>{formatDate(task.deadline)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Assigned:</Text>
            <Text style={styles.detailValue}>{formatDate(task.assignedAt)}</Text>
          </View>

          <View style={styles.detailRow}>
            <User size={16} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Assigned by:</Text>
            <Text style={styles.detailValue}>{task.assignedBy}</Text>
          </View>

          <View style={styles.detailRow}>
            <Tag size={16} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{task.category}</Text>
          </View>

          <View style={styles.detailRow}>
            <FileText size={16} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Word Count:</Text>
            <Text style={styles.detailValue}>{task.wordCount} words</Text>
          </View>

          {task.paymentAmount && (
            <View style={styles.detailRow}>
              <DollarSign size={16} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Payment:</Text>
              <Text style={styles.detailValue}>{task.paymentAmount} π</Text>
            </View>
          )}

          {task.completedAt && (
            <View style={styles.detailRow}>
              <CheckCircle size={16} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Completed:</Text>
              <Text style={styles.detailValue}>{formatDate(task.completedAt)}</Text>
            </View>
          )}
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Task Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        {task.feedback && (
          <View style={styles.feedbackCard}>
            <Text style={styles.sectionTitle}>Editor Feedback</Text>
            <Text style={styles.feedbackText}>{task.feedback}</Text>
          </View>
        )}

        {isJournalist && task.status !== "completed" && (
          <View style={styles.submissionCard}>
            <Text style={styles.sectionTitle}>Submit Your Article</Text>
            <TextInput
              style={styles.contentInput}
              multiline
              placeholder="Write your article content here..."
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitTask}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.card} />
              ) : (
                <>
                  <Send size={16} color={colors.card} />
                  <Text style={styles.submitButtonText}>Submit Article</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isAdmin && task.status === "completed" && (
          <View style={styles.reviewCard}>
            <Text style={styles.sectionTitle}>Review Submission</Text>
            <TextInput
              style={styles.feedbackInput}
              multiline
              placeholder="Provide feedback on this submission..."
              placeholderTextColor={colors.textSecondary}
              value={feedback}
              onChangeText={setFeedback}
              textAlignVertical="top"
            />
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={[styles.reviewButton, styles.rejectButton]}
                onPress={handleRejectTask}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.card} />
                ) : (
                  <>
                    <AlertCircle size={16} color={colors.card} />
                    <Text style={styles.reviewButtonText}>Request Revisions</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewButton, styles.approveButton]}
                onPress={handleApproveTask}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.card} />
                ) : (
                  <>
                    <CheckCircle size={16} color={colors.card} />
                    <Text style={styles.reviewButtonText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: "500",
    marginLeft: 4,
  },
  premiumBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  premiumText: {
    ...typography.caption,
    color: colors.card,
    fontWeight: "500",
  },
  detailsCard: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    ...typography.body,
    fontWeight: "500",
    marginLeft: 8,
    marginRight: 4,
    width: 100,
  },
  detailValue: {
    ...typography.body,
    flex: 1,
  },
  descriptionCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 12,
  },
  description: {
    ...typography.body,
    lineHeight: 22,
  },
  feedbackCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedbackText: {
    ...typography.body,
    fontStyle: "italic",
    lineHeight: 22,
  },
  submissionCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
    ...typography.body,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    ...typography.body,
    color: colors.card,
    fontWeight: "500",
    marginLeft: 8,
  },
  reviewCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedbackInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    ...typography.body,
    marginBottom: 16,
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  rejectButton: {
    backgroundColor: "#ef4444", // red
  },
  approveButton: {
    backgroundColor: "#10b981", // green
  },
  reviewButtonText: {
    ...typography.body,
    color: colors.card,
    fontWeight: "500",
    marginLeft: 8,
  },
});
