'use client';

import { useState, useCallback, useEffect } from 'react';
import { authApi } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (err) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        setUser(user);
        return true;
      } else {
        setError(response.error || 'Login failed');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Login error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register(email, password, name);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        setUser(user);
        return true;
      } else {
        setError(response.error || 'Registration failed');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Registration error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
  };
}
