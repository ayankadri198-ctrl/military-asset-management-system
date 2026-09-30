import api from './api';

export const maintenanceService = {
  async getMaintenance(params = {}) {
    const response = await api.get('/maintenance', { params });
    return response.data.data;
  },

  async getMaintenanceById(id) {
    const response = await api.get(`/maintenance/${id}`);
    return response.data.data;
  },

  async createMaintenance(data) {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  async updateMaintenance(id, data) {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },

  async deleteMaintenance(id) {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  }
};
