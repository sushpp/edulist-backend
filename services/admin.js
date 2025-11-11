import api from './api';

export const adminService = {
  getDashboardAnalytics: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getPendingInstitutes: async () => {
    const response = await api.get('/admin/institutes/pending');
    return response.data;
  },

  updateInstituteStatus: async (instituteId, status) => {
    const response = await api.put(`/admin/institutes/${instituteId}/status`, { status });
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  toggleUserStatus: async (userId, isActive) => {
    const response = await api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  getAllReviews: async () => {
    const response = await api.get('/admin/reviews');
    return response.data;
  },

  updateReviewStatus: async (reviewId, status) => {
    const response = await api.put(`/admin/reviews/${reviewId}/status`, { status });
    return response.data;
  }
};