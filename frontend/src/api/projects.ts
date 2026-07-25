import { Project } from '../types';
import { apiRequest } from './client';

export function getProjects() {
  return apiRequest<Project[]>('/api/Projects', { method: 'GET', auth: true });
}

export function createProject(payload: {
  name: string;
  description?: string | null;
  color?: string | null;
}) {
  return apiRequest<{ id: string; message: string }>('/api/Projects', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

export function updateProject(
  projectId: string,
  payload: { name: string; description?: string | null; color?: string | null }
) {
  return apiRequest<{ message: string }>(`/api/Projects/${projectId}`, {
    method: 'PUT',
    auth: true,
    body: { projectId, ...payload },
  });
}

export function deleteProject(projectId: string) {
  return apiRequest<{ message: string }>(`/api/Projects/${projectId}`, {
    method: 'DELETE',
    auth: true,
  });
}
