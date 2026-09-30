import api from './api';

export const assetService = {
  async getAssets(params = {}) {
    const response = await api.get('/assets', { params });
    return response.data;
  },

  async getAssetById(id) {
    const response = await api.get(`/assets/${id}`);
    return response.data.data;
  },

  async createAsset(assetData) {
    const response = await api.post('/assets', assetData);
    return response.data;
  },

  async updateAsset(id, assetData) {
    const response = await api.put(`/assets/${id}`, assetData);
    return response.data;
  },

  async deleteAsset(id) {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  }
};
