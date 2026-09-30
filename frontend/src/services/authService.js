import api from './api';

export const authService = {
  async register(userData, autoLogin = false) {
    const response = await api.post('/auth/register', userData);
    if (autoLogin && response.data.success && response.data.token) {
      localStorage.setItem('mams_token', response.data.token);
      localStorage.setItem('mams_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(identifier, password) {
    const response = await api.post('/auth/login', {
      identifier,
      email: identifier,
      username: identifier,
      password
    });
    if (response.data.success && response.data.token) {
      localStorage.setItem('mams_token', response.data.token);
      localStorage.setItem('mams_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('mams_token');
      localStorage.removeItem('mams_user');
    }
  },

  getCurrentUser() {
    const raw = localStorage.getItem('mams_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    if (response.data.success && response.data.user) {
      localStorage.setItem('mams_user', JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }
};
