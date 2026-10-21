import { api } from './api';

export const taskService = {
  list: (params) => api.get('/tasks', params),
  stats: (today) => api.get('/tasks/stats', { today }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  toggle: (id) => api.patch(`/tasks/${id}/toggle`),
  remove: (id) => api.delete(`/tasks/${id}`),
  clearCompleted: () => api.delete('/tasks/completed'),
};
