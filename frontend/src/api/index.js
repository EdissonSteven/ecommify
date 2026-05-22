import axios from 'axios';

const api = axios.create({
  // En dev: Vite proxia /api → localhost:3000. En Docker: nginx proxia /api → backend
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
