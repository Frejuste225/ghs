import axios from 'axios';
import toast from 'react-hot-toast';

// Configuration de base d'Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expirée. Veuillez vous reconnecter.');
    } else if (response?.status === 403) {
      toast.error('Accès refusé. Permissions insuffisantes.');
    } else if (response?.status === 404) {
      toast.error('Ressource non trouvée.');
    } else if (response?.status >= 500) {
      toast.error('Erreur serveur. Veuillez réessayer plus tard.');
    } else if (response?.data?.detail) {
      toast.error(response.data.detail);
    } else {
      toast.error('Une erreur est survenue.');
    }
    
    return Promise.reject(error);
  }
);

export default api;