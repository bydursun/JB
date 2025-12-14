import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'jobseeker' | 'employer';
  createdAt?: string;
  company?: string;
  location?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  resumeLink?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: any) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          setToken(savedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          
          // Verify token and get user profile
          const response = await api.get('/auth/profile');
          setUser(response.data.data.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (userData: any) => {
    try {
      const response = await api.put('/auth/profile', userData);
      setUser(response.data.data.user);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed';
      throw new Error(message);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
