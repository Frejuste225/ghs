import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
  },
};

// Services des employés
export const employeeService = {
  getEmployees: async (skip = 0, limit = 100) => {
    const response = await api.get(`/employees?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  getEmployee: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  
  createEmployee: async (employee) => {
    const response = await api.post('/employees', employee);
    return response.data;
  },
  
  updateEmployee: async (id, employee) => {
    const response = await api.put(`/employees/${id}`, employee);
    return response.data;
  },
  
  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};

// Services des services
export const serviceService = {
  getServices: async (skip = 0, limit = 100) => {
    const response = await api.get(`/services?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  getService: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  
  createService: async (service) => {
    const response = await api.post('/services', service);
    return response.data;
  },
  
  updateService: async (id, service) => {
    const response = await api.put(`/services/${id}`, service);
    return response.data;
  },
  
  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

// Services des demandes
export const requestService = {
  getRequests: async (skip = 0, limit = 100) => {
    const response = await api.get(`/requests?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  getMyRequests: async () => {
    const response = await api.get('/requests/my-requests');
    return response.data;
  },
  
  getPendingRequests: async () => {
    const response = await api.get('/requests/pending');
    return response.data;
  },
  
  getRequest: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },
  
  createRequest: async (request) => {
    const response = await api.post('/requests', request);
    return response.data;
  },
  
  updateRequest: async (id, request) => {
    const response = await api.put(`/requests/${id}`, request);
    return response.data;
  },
  
  approveRequest: async (id, level) => {
    const response = await api.post(`/requests/${id}/approve/${level}`);
    return response.data;
  },
  
  rejectRequest: async (id) => {
    const response = await api.post(`/requests/${id}/reject`);
    return response.data;
  },
};
