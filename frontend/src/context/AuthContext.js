import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, apiMessage, setAuthToken } from '../api/client';
import { connectSocket, disconnectSocket } from '../services/socket';
import { mockUser } from '../data/mockData';

const TOKEN_KEY = 'snap-talk-token';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const persistSession = async (nextToken, nextUser) => {
    setToken(nextToken);
    setAuthToken(nextToken);
    setUser(nextUser);

    if (nextToken && nextToken !== 'demo-token') {
      await SecureStore.setItemAsync(TOKEN_KEY, nextToken);
      connectSocket(nextToken);
    }
  };

  useEffect(() => {
    const restore = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

        if (storedToken) {
          setAuthToken(storedToken);
          const response = await api.get('/auth/me');
          await persistSession(storedToken, response.data.data);
        }
      } catch (_error) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  const login = async ({ identifier, password }) => {
    setAuthError('');
    const response = await api.post('/auth/login', { identifier, password });
    await persistSession(response.data.data.token, response.data.data.user);
    return response.data.data.user;
  };

  const signup = async ({ username, fullName, identifier, password }) => {
    setAuthError('');
    const isEmail = identifier.includes('@');
    const response = await api.post('/auth/signup', {
      username,
      fullName,
      email: isEmail ? identifier : undefined,
      mobile: isEmail ? undefined : identifier,
      password,
    });
    await persistSession(response.data.data.token, response.data.data.user);
    return response.data.data.user;
  };

  const forgotPassword = async (identifier) => {
    try {
      setAuthError('');
      return await api.post('/auth/forgot-password', { identifier });
    } catch (error) {
      const message = apiMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const setupProfile = async (payload) => {
    if (token === 'demo-token') {
      setUser((current) => ({ ...current, ...payload, profileSetupCompleted: true }));
      return;
    }

    const response = await api.patch('/auth/setup-profile', payload);
    setUser(response.data.data);
  };

  const updateProfile = async (payload) => {
    if (token === 'demo-token') {
      setUser((current) => ({ ...current, ...payload }));
      return;
    }

    const response = await api.patch('/users/me', payload);
    setUser(response.data.data);
  };

  const continueDemo = async () => {
    await persistSession('demo-token', mockUser);
  };

  const logout = async () => {
    disconnectSocket();
    setAuthToken('');
    setToken('');
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  const value = {
    token,
    user,
    loading,
    authError,
    isDemo: token === 'demo-token',
    login,
    signup,
    forgotPassword,
    setupProfile,
    updateProfile,
    continueDemo,
    logout,
    setAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
