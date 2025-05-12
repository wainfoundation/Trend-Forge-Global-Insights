export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed" | "overdue";
  deadline: string;
  assignedAt: string;
  assignedBy: string;
  isPremium: boolean;
  category: string;
  wordCount: number;
  completedAt?: string;
  feedback?: string;
  paymentAmount?: number;
}
