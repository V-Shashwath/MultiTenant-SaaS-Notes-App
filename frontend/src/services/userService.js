import api from './api.js';

export const userService = {
  // Get current user profile (alias for authService)
  getProfile: () => 
    api.get('/auth/profile'),
  
  // Invite a new user (Admin only)
  inviteUser: (userData) =>
    api.post('/users/invite', userData),
  
  // Get all users in tenant (Admin only)
  getTenantUsers: (page = 1, limit = 20) =>
    api.get(`/users?page=${page}&limit=${limit}`),
  
  // Update user role (Admin only)
  updateUserRole: (userId, role) =>
    api.put(`/users/${userId}/role`, { role }),
  
  // Remove user from tenant (Admin only)
  removeUser: (userId) =>
    api.delete(`/users/${userId}`),
  
  // Update user profile (if implemented)
  updateProfile: (userData) =>
    api.put('/users/profile', userData),
  
  // Change password (if implemented)
  changePassword: (passwordData) =>
    api.put('/users/change-password', passwordData),
  
  // Get user preferences (if implemented)
  getPreferences: () =>
    api.get('/users/preferences'),
  
  // Update user preferences (if implemented)
  updatePreferences: (preferences) =>
    api.put('/users/preferences', preferences),
};