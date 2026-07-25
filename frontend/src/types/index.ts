export enum PriorityLevel {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export interface User {
  userId: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  weeklyGoal: number;
  categories: Category[];
  tasks: TaskItem[];
}

export interface Category {
  categoryId: string;
  name: string;
  userId: string;
  tasks: TaskItem[];
}

export interface Project {
  projectId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  userId: string;
  createdAt: Date;
  taskCount?: number;
  completedTaskCount?: number;
}

export interface Reminder {
  reminderId: string;
  taskId: string;
  remindAt: Date;
  isSent: boolean;
}

export interface Note {
  noteId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskItem {
  taskId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  dueDate?: Date;
  priority: PriorityLevel;
  userId: string;
  categoryId?: string;
  projectId?: string;
  category?: Category;
  project?: Project;
  reminders: Reminder[];
  estimatedMinutes?: number | null;
  scheduleStartMinutes?: number | null;
  scheduleEndMinutes?: number | null;
  isPinnedFocus?: boolean;
  trackingStartedAt?: Date | null;
  trackingElapsedSeconds?: number;
}
