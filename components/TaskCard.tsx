import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Clock, AlertCircle, CheckCircle, Calendar } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
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
        return <CheckCircle size={16} color={getStatusColor(status)} />;
      case "pending":
        return <Clock size={16} color={getStatusColor(status)} />;
      case "overdue":
        return <AlertCircle size={16} color={getStatusColor(status)} />;
      default:
        return null;
    }
  };

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    // Check if deadline is today
    if (
      deadlineDate.getDate() === now.getDate() &&
      deadlineDate.getMonth() === now.getMonth() &&
      deadlineDate.getFullYear() === now.getFullYear()
    ) {
      return `Today, ${deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if deadline is tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (
      deadlineDate.getDate() === tomorrow.getDate() &&
      deadlineDate.getMonth() === tomorrow.getMonth() &&
      deadlineDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return `Tomorrow, ${deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise, show full date
    return deadlineDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    if (task.status === "completed") {
      return "Completed";
    }
    
    if (deadlineDate < now) {
      return "Overdue";
    }
    
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 24) {
      const days = Math.floor(diffHrs / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m left`;
    }
    
    return `${diffMins}m left`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          {task.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + "20" }]}>
          {getStatusIcon(task.status)}
          <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.deadlineContainer}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={styles.deadlineText}>{formatDeadline(task.deadline)}</Text>
        </View>
        <Text
          style={[
            styles.timeRemaining,
            task.status === "overdue" && styles.overdueText,
            task.status === "completed" && styles.completedText,
          ]}
        >
          {getTimeRemaining(task.deadline)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  title: {
    ...typography.body,
    fontWeight: "500",
    marginRight: 8,
    flex: 1,
  },
  premiumBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  premiumText: {
    ...typography.caption,
    color: colors.card,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "500",
    marginLeft: 4,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deadlineText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  timeRemaining: {
    ...typography.caption,
    fontWeight: "500",
    color: "#f59e0b", // amber
  },
  overdueText: {
    color: "#ef4444", // red
  },
  completedText: {
    color: "#10b981", // green
  },
});
