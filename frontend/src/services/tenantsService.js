import api from './api.js';

export const tenantsService = {
  // Get tenant information
  getTenantInfo: (slug) => 
    api.get(`/tenants/${slug}`),
  
  // Upgrade tenant subscription (Admin only)
  upgradeTenant: (slug) => 
    api.post(`/tenants/${slug}/upgrade`),
  
  // Get tenant statistics (Admin only)
  getTenantStats: (slug) => 
    api.get(`/tenants/${slug}/stats`),
  
  // Get tenant usage information
  getTenantUsage: (slug) =>
    api.get(`/tenants/${slug}/usage`),
};

// ===================================

