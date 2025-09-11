import api from './api';

// Services
export const serviceService = {
  async getAll() {
    const response = await api.get('/services');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/services', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

// Employés
export const employeeService = {
  async getAll() {
    const response = await api.get('/employees');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/employees', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};

// Comptes
export const accountService = {
  async getAll() {
    const response = await api.get('/accounts');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/accounts', data);
    return response.data;
  },
};

// Demandes
export const requestService = {
  async getAll() {
    const response = await api.get('/requests');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/requests', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/requests/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  },
};

// Délégations
export const delegationService = {
  async getAll() {
    const response = await api.get('/delegations');
    return response.data;
  },

  async create(data) {
    const response = await api.post('/delegations', data);
    return response.data;
  },
};

// Workflows
export const workflowService = {
  async getAll() {
    const response = await api.get('/workflows');
    return response.data;
  },

  async create(data) {
    const response = await api.post('/workflows', data);
    return response.data;
  },
};