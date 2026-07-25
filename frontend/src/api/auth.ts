import { apiRequest } from './client';

export interface AuthResult {
  token: string;
  userId: string;
  username: string;
  email: string;
  weeklyGoal: number;
}

export function login(email: string, password: string) {
  return apiRequest<AuthResult>('/api/Users/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(username: string, email: string, password: string) {
  return apiRequest<AuthResult>('/api/Users/register', {
    method: 'POST',
    body: { username, email, password },
  });
}
