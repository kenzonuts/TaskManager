import { Category } from '../types';
import { apiRequest } from './client';

export function getCategories() {
  return apiRequest<Category[]>('/api/Categories', { method: 'GET', auth: true });
}

export function createCategory(name: string) {
  return apiRequest<{ id: string; message: string }>('/api/Categories', {
    method: 'POST',
    auth: true,
    body: { name },
  });
}

export function updateCategory(categoryId: string, name: string) {
  return apiRequest<{ message: string }>(`/api/Categories/${categoryId}`, {
    method: 'PUT',
    auth: true,
    body: { categoryId, name },
  });
}

export function deleteCategory(categoryId: string) {
  return apiRequest<{ message: string }>(`/api/Categories/${categoryId}`, {
    method: 'DELETE',
    auth: true,
  });
}
