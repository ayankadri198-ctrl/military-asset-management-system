import api from './api';

export const reportService = {
  async getSummary() {
    const response = await api.get('/reports/summary');
    return response.data.data;
  },

  async exportData(module = 'assets') {
    const response = await api.get('/reports/export', { params: { module } });
    return response.data;
  }
};

export const notificationService = {
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};

export const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};

export const userService = {
  async getUsers() {
    const response = await api.get('/users');
    return response.data.data;
  },

  async createUser(data) {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
