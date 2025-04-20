import axios from 'axios';

const API = axios.create({
  baseURL: ' https://7e3b-2409-4081-1e-1c9c-7955-3e55-1d71-ed2.ngrok-free.app',
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
