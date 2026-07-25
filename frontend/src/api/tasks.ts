import { TaskItem } from '../types';
import { apiRequest } from './client';

export function getUserTasks() {
  return apiRequest<TaskItem[]>('/api/Tasks/GetUserTasks', { method: 'GET', auth: true });
}

export function createTask(payload: {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority: number;
  categoryId?: string | null;
}) {
  return apiRequest<{ id: string; message: string }>('/api/Tasks', {
    method: 'POST',
    auth: true,
    body: {
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate,
      priority: payload.priority,
      categoryId: payload.categoryId || null,
    },
  });
}

export function updateTask(
  taskId: string,
  payload: {
    title: string;
    description?: string | null;
    dueDate?: string | null;
    priority: number;
    categoryId?: string | null;
  }
) {
  return apiRequest<{ id: string; message: string }>(`/api/Tasks/${taskId}`, {
    method: 'PUT',
    auth: true,
    body: {
      taskId,
      title: payload.title,
      description: payload.description ?? null,
      dueDate: payload.dueDate ?? null,
      priority: payload.priority,
      categoryId: payload.categoryId || null,
    },
  });
}

export function updateTaskCompletion(taskId: string, isCompleted: boolean) {
  return apiRequest<{ message: string }>(`/api/Tasks/${taskId}/complete`, {
    method: 'PUT',
    auth: true,
    body: { taskId, isCompleted },
  });
}
