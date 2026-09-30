import api from './api';

export const personnelService = {
  async getPersonnel(params = {}) {
    const response = await api.get('/personnel', { params });
    return response.data.data;
  },

  async getPersonnelById(id) {
    const response = await api.get(`/personnel/${id}`);
    return response.data.data;
  },

  async createPersonnel(data) {
    const response = await api.post('/personnel', data);
    return response.data;
  },

  async updatePersonnel(id, data) {
    const response = await api.put(`/personnel/${id}`, data);
    return response.data;
  },

  async deletePersonnel(id) {
    const response = await api.delete(`/personnel/${id}`);
    return response.data;
  }
};
