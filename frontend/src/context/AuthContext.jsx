import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('lifequest_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Restore session
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('lifequest_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getCurrentUser();
        setUser(data.user);
        setCharacter(data.character);
        // Apply theme if equipped
        if (data.character?.theme) {
          document.documentElement.setAttribute('data-theme', data.character.theme);
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        localStorage.removeItem('lifequest_token');
        setUser(null);
        setCharacter(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.login({ identifier, password });
    localStorage.setItem('lifequest_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setCharacter(res.character);
    if (res.character?.theme) {
      document.documentElement.setAttribute('data-theme', res.character.theme);
    }
    return res;
  };

  const signup = async (payload) => {
    const res = await api.signup(payload);
    localStorage.setItem('lifequest_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setCharacter(res.character);
    if (res.character?.theme) {
      document.documentElement.setAttribute('data-theme', res.character.theme);
    }
    return res;
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    localStorage.setItem('lifequest_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setCharacter(res.character);
    if (res.character?.theme) {
      document.documentElement.setAttribute('data-theme', res.character.theme);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('lifequest_token');
    setToken(null);
    setUser(null);
    setCharacter(null);
    document.documentElement.removeAttribute('data-theme');
  };

  const updateCharacterState = (updated) => {
    setCharacter(prev => ({ ...prev, ...updated }));
    if (updated?.theme) {
      document.documentElement.setAttribute('data-theme', updated.theme);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      character,
      token,
      isLoading,
      login,
      signup,
      demoLogin,
      logout,
      updateCharacterState,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
