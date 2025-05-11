import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useTaskStore } from "@/store/task-store";
import { useAuthStore } from "@/store/auth-store";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  Filter,
  ChevronDown,
} from "lucide-react-native";
import TaskCard from "@/components/TaskCard";

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { isJournalist, isAdmin } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is journalist or admin
  if (!isJournalist && !isAdmin) {
    router.replace("/unauthorized");
    return null;
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTasks().finally(() => setRefreshing(false));
  }, []);

  // Filter tasks based on selected status
  const filteredTasks = selectedStatus
    ? tasks.filter((task) => task.status === selectedStatus)
    : tasks;

  // Sort tasks by deadline (closest first)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const pendingCount = tasks.filter(task => task.status === "pending").length;
  const completedCount = tasks.filter(task => task.status === "completed").length;
  const overdueCount = tasks.filter(task => task.status === "overdue").length;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Stack.Screen options={{ title: "My Tasks" }} />

      <View style={styles.header}>
        <Text style={[typography.h2, styles.title]}>My Tasks</Text>
        <Text style={styles.subtitle}>
          Manage and track your assigned tasks
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[
              styles.statCard,
              selectedStatus === "pending" && styles.selectedStatCard,
            ]}
            onPress={() => setSelectedStatus(selectedStatus === "pending" ? null : "pending")}
          >
            <View style={[styles.statIcon, styles.pendingIcon]}>
              <Clock size={20} color={colors.card} />
            </View>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statCard,
              selectedStatus === "completed" && styles.selectedStatCard,
            ]}
            onPress={() => setSelectedStatus(selectedStatus === "completed" ? null : "completed")}
          >
            <View style={[styles.statIcon, styles.completedIcon]}>
              <CheckCircle size={20} color={colors.card} />
            </View>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[
              styles.statCard,
              selectedStatus === "overdue" && styles.selectedStatCard,
            ]}
            onPress={() => setSelectedStatus(selectedStatus === "overdue" ? null : "overdue")}
          >
            <View style={[styles.statIcon, styles.overdueIcon]}>
              <AlertCircle size={20} color={colors.card} />
            </View>
            <Text style={styles.statValue}>{overdueCount}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setSelectedStatus(null)}
          >
            <View style={[styles.statIcon, styles.allIcon]}>
              <Filter size={20} color={colors.card} />
            </View>
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>All Tasks</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>
          {selectedStatus
            ? `Showing ${selectedStatus} tasks`
            : "Showing all tasks"}
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowStatusFilter(!showStatusFilter)}
        >
          <Text style={styles.filterButtonText}>
            {selectedStatus ? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1) : "All"}
          </Text>
          <ChevronDown
            size={16}
            color={colors.text}
            style={{
              transform: [{ rotate: showStatusFilter ? "180deg" : "0deg" }],
            }}
          />
        </TouchableOpacity>
      </View>

      {showStatusFilter && (
        <View style={styles.statusFilterContainer}>
          <TouchableOpacity
            style={[
              styles.statusFilterItem,
              selectedStatus === null && styles.statusFilterItemSelected,
            ]}
            onPress={() => {
              setSelectedStatus(null);
              setShowStatusFilter(false);
            }}
          >
            <Text
              style={[
                styles.statusFilterText,
                selectedStatus === null && styles.statusFilterTextSelected,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {["pending", "completed", "overdue"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilterItem,
                selectedStatus === status && styles.statusFilterItemSelected,
              ]}
              onPress={() => {
                setSelectedStatus(status);
                setShowStatusFilter(false);
              }}
            >
              {status === "pending" && <Clock size={16} color={selectedStatus === status ? colors.primary : "#f59e0b"} />}
              {status === "completed" && <CheckCircle size={16} color={selectedStatus === status ? colors.primary : "#10b981"} />}
              {status === "overdue" && <AlertCircle size={16} color={selectedStatus === status ? colors.primary : "#ef4444"} />}
              <Text
                style={[
                  styles.statusFilterText,
                  selectedStatus === status && styles.statusFilterTextSelected,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : sortedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks found</Text>
          {selectedStatus && (
            <Text style={styles.emptySubtext}>
              Try selecting a different filter
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.taskListContainer}>
          <FlatList
            data={sortedTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() => router.push(`/task/${item.id}`)}
              />
            )}
            scrollEnabled={false}
          />
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
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    width: "48%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedStatCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  pendingIcon: {
    backgroundColor: "#f59e0b", // amber
  },
  completedIcon: {
    backgroundColor: "#10b981", // green
  },
  overdueIcon: {
    backgroundColor: "#ef4444", // red
  },
  allIcon: {
    backgroundColor: colors.primary,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginVertical: 4,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonText: {
    ...typography.bodySmall,
    marginRight: 4,
  },
  statusFilterContainer: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusFilterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  statusFilterItemSelected: {
    backgroundColor: colors.primary + "20", // 20% opacity
  },
  statusFilterText: {
    ...typography.body,
    marginLeft: 8,
  },
  statusFilterTextSelected: {
    color: colors.primary,
    fontWeight: "500",
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
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  taskListContainer: {
    padding: 16,
    paddingTop: 0,
  },
});
