import { TaskItem } from '../types';
import { apiRequest } from './client';

export type TaskWritePayload = {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: number;
  categoryId?: string | null;
  estimatedMinutes?: number | null;
  scheduleStartMinutes?: number | null;
  scheduleEndMinutes?: number | null;
  isPinnedFocus?: boolean;
};

export function getUserTasks() {
  return apiRequest<TaskItem[]>('/api/Tasks/GetUserTasks', { method: 'GET', auth: true });
}

export function createTask(payload: TaskWritePayload) {
  return apiRequest<{ id: string; message: string }>('/api/Tasks', {
    method: 'POST',
    auth: true,
    body: {
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate,
      priority: payload.priority,
      categoryId: payload.categoryId || null,
      estimatedMinutes: payload.estimatedMinutes ?? null,
      scheduleStartMinutes: payload.scheduleStartMinutes ?? null,
      scheduleEndMinutes: payload.scheduleEndMinutes ?? null,
    },
  });
}

export function updateTask(taskId: string, payload: TaskWritePayload) {
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
      estimatedMinutes: payload.estimatedMinutes ?? null,
      scheduleStartMinutes: payload.scheduleStartMinutes ?? null,
      scheduleEndMinutes: payload.scheduleEndMinutes ?? null,
      isPinnedFocus: payload.isPinnedFocus ?? null,
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

export function pinFocus(taskId: string, isPinned: boolean) {
  return apiRequest<{ message: string }>(`/api/Tasks/${taskId}/pin-focus`, {
    method: 'PUT',
    auth: true,
    body: { taskId, isPinned },
  });
}

export function startTracking(taskId: string) {
  return apiRequest<{ message: string }>(`/api/Tasks/${taskId}/tracking/start`, {
    method: 'POST',
    auth: true,
  });
}

export function stopTracking(taskId: string) {
  return apiRequest<{ message: string }>(`/api/Tasks/${taskId}/tracking/stop`, {
    method: 'POST',
    auth: true,
  });
}
