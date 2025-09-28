import api from './api.js';

export const authService = {
  // Login user
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  // Logout user
  logout: () => 
    api.post('/auth/logout'),
  
  // Get current user profile
  getProfile: () => 
    api.get('/auth/profile'),
  
  // Verify JWT token
  verifyToken: () => 
    api.get('/auth/verify'),
};