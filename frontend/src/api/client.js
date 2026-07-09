import axios from 'axios';

const client = axios.create({
  baseURL: 'https://gogita8.pythonanywhere.com/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default client;
