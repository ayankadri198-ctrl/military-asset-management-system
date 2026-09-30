import api from './api';

export const vehicleService = {
  async getVehicles(params = {}) {
    const response = await api.get('/vehicles', { params });
    return response.data.data;
  },

  async getVehicleById(id) {
    const response = await api.get(`/vehicles/${id}`);
    return response.data.data;
  },

  async createVehicle(data) {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  async updateVehicle(id, data) {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  async deleteVehicle(id) {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  }
};
