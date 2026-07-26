import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  darkMode: boolean;
  activeTab: string;
  toasts: ToastMessage[];
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string; role?: string; phone?: string }) => Promise<boolean>;
  logout: () => void;
  toggleDarkMode: () => void;
  setActiveTab: (tab: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
  openAuthModal: (initialMode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  isDocsOpen: boolean;
  setIsDocsOpen: (open: boolean) => void;
  demoQuickLogin: (role: 'passenger' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('railway_dark_mode') === 'true';
  });
  const [activeTab, setActiveTab] = useState<string>('home'); // 'home', 'trains', 'stations', 'tracking', 'dashboard', 'admin'
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Sync Dark Mode class with <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('railway_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('railway_dark_mode', 'false');
    }
  }, [darkMode]);

  // Load Current User on Mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const res = await api.getCurrentUser();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        // Clear stale token if invalid
        api.clearToken();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    if (res.success && res.data) {
      api.setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }
      showToast('success', 'Welcome Back', `Logged in as ${res.data.user.name}`);
      closeAuthModal();
      return true;
    } else {
      showToast('error', 'Login Failed', res.errors?.[0] || res.message || 'Check credentials');
      return false;
    }
  };

  const register = async (userData: { name: string; email: string; password: string; role?: string; phone?: string }) => {
    const res = await api.register(userData);
    if (res.success && res.data) {
      api.setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }
      showToast('success', 'Account Created', `Welcome to Railway Platform, ${res.data.user.name}`);
      closeAuthModal();
      return true;
    } else {
      showToast('error', 'Registration Error', res.errors?.[0] || res.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    showToast('info', 'Logged Out', 'You have been safely logged out.');
    setActiveTab('home');
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const demoQuickLogin = async (role: 'passenger' | 'admin') => {
    if (role === 'admin') {
      await login({ email: 'admin@railway.gov', password: 'AdminPass123!' });
    } else {
      await login({ email: 'passenger@railway.com', password: 'Passenger123!' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        darkMode,
        activeTab,
        toasts,
        login,
        register,
        logout,
        toggleDarkMode,
        setActiveTab,
        showToast,
        removeToast,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
        isDocsOpen,
        setIsDocsOpen,
        demoQuickLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
