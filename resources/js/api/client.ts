import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach Sanctum token from localStorage on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ht_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 redirect to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ht_token');
      localStorage.removeItem('ht_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default client;
