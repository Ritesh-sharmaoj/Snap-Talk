import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, apiMessage, getStoredAccessToken, getStoredRefreshToken, setAuthTokens } from '../api/client';
import { connectSocket, disconnectSocket } from '../services/socket';
import { mockUser } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const persistSession = async (accessToken, refreshToken, nextUser) => {
    await setAuthTokens(accessToken, refreshToken);
    setUser(nextUser);

    if (accessToken && accessToken !== 'demo-token') {
      connectSocket(accessToken);
    }
  };

  useEffect(() => {
    const restore = async () => {
      try {
        const storedToken = await getStoredAccessToken();

        if (storedToken) {
          if (storedToken === 'demo-token') {
            setUser({ ...mockUser, isDemo: true });
          } else {
            api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
            const response = await api.get('/auth/me');
            setUser(response.data.data);
            connectSocket(storedToken);
          }
        }
      } catch (_error) {
        await setAuthTokens(null, null);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  const login = async ({ identifier, password }) => {
    try {
      setAuthError('');
      const response = await api.post('/auth/login', { identifier, password });
      const { accessToken, refreshToken, user: userData } = response.data.data;
      await persistSession(accessToken, refreshToken, userData);
      return userData;
    } catch (error) {
      const message = apiMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const signup = async ({ username, fullName, identifier, password }) => {
    try {
      setAuthError('');
      const isEmail = identifier.includes('@');
      const response = await api.post('/auth/signup', {
        username,
        fullName,
        email: isEmail ? identifier : undefined,
        mobile: isEmail ? undefined : identifier,
        password,
      });
      const { accessToken, refreshToken, user: userData } = response.data.data;
      await persistSession(accessToken, refreshToken, userData);
      return userData;
    } catch (error) {
      const message = apiMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
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
    try {
      if (user && user.isDemo) {
        setUser((current) => ({ ...current, ...payload, profileSetupCompleted: true }));
        return;
      }

      const response = await api.patch('/auth/setup-profile', payload);
      setUser(response.data.data);
    } catch (error) {
      const message = apiMessage(error);
      throw new Error(message);
    }
  };

  const updateProfile = async (payload) => {
    try {
      if (user && user.isDemo) {
        setUser((current) => ({ ...current, ...payload }));
        return;
      }

      const response = await api.patch('/users/me', payload);
      setUser(response.data.data);
    } catch (error) {
      const message = apiMessage(error);
      throw new Error(message);
    }
  };

  const continueDemo = async () => {
    await persistSession('demo-token', null, { ...mockUser, isDemo: true });
  };

  const logout = async () => {
    try {
      const refreshToken = await getStoredRefreshToken();
      if (refreshToken && !user?.isDemo) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (_error) {
      // Ignore logout errors
    } finally {
      disconnectSocket();
      await setAuthTokens(null, null);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    authError,
    isDemo: !!user?.isDemo,
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
