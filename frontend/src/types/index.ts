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
  categories: Category[];
  tasks: TaskItem[];
}

export interface Category {
  categoryId: string;
  name: string;
  userId: string;
  tasks: TaskItem[];
}

export interface Reminder {
  reminderId: string;
  taskId: string;
  remindAt: Date;
  isSent: boolean;
}

export interface TaskItem {
  taskId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: PriorityLevel;
  userId: string;
  categoryId?: string;
  category?: Category;
  reminders: Reminder[];
}
