import { Reminder } from '../types';
import { apiRequest } from './client';

export interface ReminderDto {
  reminderId: string;
  taskId: string;
  remindAt: string;
  isSent: boolean;
}

export function getRemindersByTask(taskId: string) {
  return apiRequest<ReminderDto[]>(`/api/Reminders/task/${taskId}`, {
    method: 'GET',
    auth: true,
  });
}

export function createReminder(taskId: string, remindAt: string) {
  return apiRequest<{ id: string; message: string }>('/api/Reminders', {
    method: 'POST',
    auth: true,
    body: { taskId, remindAt },
  });
}

export function deleteReminder(reminderId: string) {
  return apiRequest<{ message: string }>(`/api/Reminders/${reminderId}`, {
    method: 'DELETE',
    auth: true,
  });
}

export function toReminder(dto: ReminderDto): Reminder {
  return {
    reminderId: dto.reminderId,
    taskId: dto.taskId,
    remindAt: new Date(dto.remindAt),
    isSent: dto.isSent,
  };
}
