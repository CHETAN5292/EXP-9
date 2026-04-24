// src/utils/api.js
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  getStats: () => api.get('/students/stats'),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

export default api;
