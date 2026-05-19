import { create } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'snap-talk-access-token';
const REFRESH_TOKEN_KEY = 'snap-talk-refresh-token';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5002/api';

export const api = create({
  baseURL: API_URL,
  timeout: 15000,
});

const tokenStorage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      return window.localStorage.getItem(key);
    }

    return SecureStore.getItemAsync(key);
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key) {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};

export const getStoredAccessToken = () => tokenStorage.getItem(TOKEN_KEY);

export const getStoredRefreshToken = () => tokenStorage.getItem(REFRESH_TOKEN_KEY);

export const setAuthTokens = async (accessToken, refreshToken) => {
  if (accessToken) {
    await tokenStorage.setItem(TOKEN_KEY, accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    await tokenStorage.deleteItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }

  if (refreshToken) {
    await tokenStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    await tokenStorage.deleteItem(REFRESH_TOKEN_KEY);
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await getStoredRefreshToken();

      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh-token', { refreshToken });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

          await setAuthTokens(newAccessToken, newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          await setAuthTokens(null, null);
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const apiMessage = (error, fallback = 'Something went wrong.') => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message === 'Network Error') {
    return `Network Error. API reachable hai ya nahi check karein: ${API_URL}`;
  }

  if (error?.code === 'ECONNABORTED') {
    return `Request timeout. API slow/unreachable hai: ${API_URL}`;
  }

  return error?.message || fallback;
};
