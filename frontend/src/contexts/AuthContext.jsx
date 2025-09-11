import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      toast.success('Connexion réussie !');
      return response;
    } catch (error) {
      toast.error('Erreur de connexion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  const hasPermission = (requiredProfiles) => {
    return authService.hasPermission(requiredProfiles);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};