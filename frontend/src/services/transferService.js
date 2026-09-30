import api from './api';

export const transferService = {
  async getTransfers(params = {}) {
    const response = await api.get('/transfers', { params });
    return response.data.data;
  },

  async createTransfer(data) {
    const response = await api.post('/transfers', data);
    return response.data;
  },

  async updateTransferStatus(id, status) {
    const response = await api.put(`/transfers/${id}/status`, { status });
    return response.data;
  }
};
