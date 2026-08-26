import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, getStoredToken, loginUser, registerUser, clearAuthSession } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    mode: 'login', // 'login' | 'register'
    role: 'customer', // 'customer' | 'owner'
    onSuccessCallback: null
  });

  const openAuthModal = (options = {}) => {
    setAuthModalConfig({
      mode: options.mode || 'login',
      role: options.role || 'customer',
      onSuccessCallback: options.onSuccess || null
    });
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalConfig((prev) => ({ ...prev, onSuccessCallback: null }));
  };

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      if (authModalConfig.onSuccessCallback) {
        authModalConfig.onSuccessCallback(res.user);
      }
      closeAuthModal();
    }
    return res;
  };

  const register = async (formData) => {
    const res = await registerUser(formData);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      if (authModalConfig.onSuccessCallback) {
        authModalConfig.onSuccessCallback(res.user);
      }
      closeAuthModal();
    }
    return res;
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalConfig,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
