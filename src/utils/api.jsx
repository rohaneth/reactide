import axios from 'axios';

const API = axios.create({
  baseURL: 'https://0fee-2409-4081-1e-1c9c-1897-c84e-a5c8-4be2.ngrok-free.app',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
