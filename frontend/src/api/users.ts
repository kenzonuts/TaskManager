import { apiRequest } from './client';

export type SettingsResult = {
  userId: string;
  username: string;
  email: string;
  weeklyGoal: number;
};

export function updateSettings(payload: {
  username?: string;
  weeklyGoal?: number;
}) {
  return apiRequest<SettingsResult>('/api/Users/me/settings', {
    method: 'PUT',
    auth: true,
    body: payload,
  });
}
