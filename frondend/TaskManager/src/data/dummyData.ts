import { TaskItem, PriorityLevel } from '../types';

export const dummyTasks: TaskItem[] = [
  {
    taskId: '1',
    title: 'Complete project proposal',
    description: 'Write and finalize the project proposal document',
    isCompleted: false,
    createdAt: new Date('2023-10-01'),
    dueDate: new Date('2023-10-15'),
    priority: PriorityLevel.High,
    userId: 'user1', // Assuming a dummy userId
    categoryId: 'cat1',
    category: {
      categoryId: 'cat1',
      name: 'Work',
      userId: 'user1',
      tasks: []
    },
    reminders: []
  },
  {
    taskId: '2',
    title: 'Buy groceries',
    description: 'Purchase weekly groceries',
    isCompleted: true,
    createdAt: new Date('2023-10-02'),
    dueDate: new Date('2023-10-05'),
    priority: PriorityLevel.Medium,
    userId: 'user1',
    categoryId: 'cat2',
    category: {
      categoryId: 'cat2',
      name: 'Personal',
      userId: 'user1',
      tasks: []
    },
    reminders: []
  },
  {
    taskId: '3',
    title: 'Review code changes',
    description: 'Review the latest pull request',
    isCompleted: false,
    createdAt: new Date('2023-10-03'),
    priority: PriorityLevel.Critical,
    userId: 'user1',
    categoryId: 'cat1',
    category: {
      categoryId: 'cat1',
      name: 'Work',
      userId: 'user1',
      tasks: []
    },
    reminders: []
  }
];
