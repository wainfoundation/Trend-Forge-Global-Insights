import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import { Task } from "@/types/task";

// Mock tasks data
const mockTasks: Task[] = [
  {
    id: "task1",
    title: "Write article about Pi Network updates",
    description: "Cover the latest updates to the Pi Network ecosystem, including new features and partnerships.",
    status: "pending",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // 3 hours from now
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    assignedBy: "editor1",
    isPremium: false,
    category: "Technology",
    wordCount: 800,
  },
  {
    id: "task2",
    title: "Interview with Pi Core Team member",
    description: "Conduct and transcribe an interview with a Pi Core Team member about the future of Pi Network.",
    status: "pending",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day from now
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    assignedBy: "editor2",
    isPremium: true,
    category: "Interview",
    wordCount: 1500,
  },
  {
    id: "task3",
    title: "Pi Network security analysis",
    description: "Write a detailed analysis of Pi Network's security features and how they compare to other cryptocurrencies.",
    status: "completed",
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    assignedBy: "editor1",
    isPremium: true,
    category: "Security",
    wordCount: 1200,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hours ago
    feedback: "Excellent analysis with good technical depth. Approved for publication.",
    paymentAmount: 15,
  },
  {
    id: "task4",
    title: "Pi Network mining guide for beginners",
    description: "Create a beginner-friendly guide explaining how Pi Network mining works and how to get started.",
    status: "overdue",
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    assignedBy: "editor3",
    isPremium: false,
    category: "Tutorial",
    wordCount: 1000,
  },
  {
    id: "task5",
    title: "Pi Network vs other mobile cryptocurrencies",
    description: "Compare Pi Network with other mobile-based cryptocurrencies, highlighting pros and cons of each.",
    status: "pending",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 2 days from now
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    assignedBy: "editor2",
    isPremium: false,
    category: "Analysis",
    wordCount: 1200,
  },
];

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  getTask: (id: string) => Task | undefined;
  updateTaskStatus: (id: string, status: Task["status"], completedAt?: string) => Promise<void>;
  submitTask: (id: string, content: string) => Promise<void>;
  addFeedback: (id: string, feedback: string, approved: boolean) => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: mockTasks,
      isLoading: false,
      error: null,
      
      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now, we'll simulate a delay and return mock data
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check for overdue tasks
          const now = new Date();
          const updatedTasks = mockTasks.map(task => {
            if (task.status === "pending" && new Date(task.deadline) < now) {
              return { ...task, status: "overdue" as const };
            }
            return task;
          });
          
          set({ tasks: updatedTasks, isLoading: false });
        } catch (error) {
          set({ error: "Failed to fetch tasks", isLoading: false });
        }
      },
      
      getTask: (id: string) => {
        return get().tasks.find(task => task.id === id);
      },
      
      updateTaskStatus: async (id: string, status: Task["status"], completedAt?: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const updatedTasks = get().tasks.map(task => {
            if (task.id === id) {
              return { 
                ...task, 
                status, 
                completedAt: status === "completed" ? completedAt || new Date().toISOString() : task.completedAt 
              };
            }
            return task;
          });
          
          set({ tasks: updatedTasks, isLoading: false });
        } catch (error) {
          set({ error: "Failed to update task status", isLoading: false });
        }
      },
      
      submitTask: async (id: string, content: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          const updatedTasks = get().tasks.map(task => {
            if (task.id === id) {
              return { 
                ...task, 
                status: "completed" as const,
                completedAt: new Date().toISOString()
              };
            }
            return task;
          });
          
          set({ tasks: updatedTasks, isLoading: false });
        } catch (error) {
          set({ error: "Failed to submit task", isLoading: false });
        }
      },
      
      addFeedback: async (id: string, feedback: string, approved: boolean) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const updatedTasks = get().tasks.map(task => {
            if (task.id === id) {
              return { 
                ...task, 
                feedback,
                status: approved ? "completed" as const : "pending" as const
              };
            }
            return task;
          });
          
          set({ tasks: updatedTasks, isLoading: false });
        } catch (error) {
          set({ error: "Failed to add feedback", isLoading: false });
        }
      },
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
