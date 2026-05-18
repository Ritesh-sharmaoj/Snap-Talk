import { create } from 'axios';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = create({
  baseURL: API_URL,
  timeout: 15000,
});

let authToken = '';

export const setAuthToken = (token) => {
  authToken = token || '';
};

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

export const apiMessage = (error, fallback = 'Something went wrong.') =>
  error?.response?.data?.message || error?.message || fallback;
