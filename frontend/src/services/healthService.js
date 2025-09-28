import api from './api.js';

export const healthService = {
  // Basic health check
  check: () => 
    api.get('/health'),
  
  // Detailed health check
  detailed: () => 
    api.get('/health/detailed'),
};
