import { useState, useEffect } from 'react';
import { tenantsService } from '../services/authService';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useTenant = () => {
  const { user, updateUser } = useAuth();
  const [tenantInfo, setTenantInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTenantInfo = async () => {
    if (!user?.tenant_slug) return;

    try {
      setLoading(true);
      const response = await tenantsService.getTenantInfo(user.tenant_slug);
      setTenantInfo(response.data.tenant);
    } catch (error) {
      console.error('Load tenant info error:', error);
      toast.error('Failed to load tenant information');
    } finally {
      setLoading(false);
    }
  };

  const loadTenantStats = async () => {
    if (!user?.tenant_slug) return;

    try {
      const response = await tenantsService.getTenantStats(user.tenant_slug);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Load tenant stats error:', error);
      toast.error('Failed to load tenant statistics');
    }
  };

  const upgradeTenant = async () => {
    if (!user?.tenant_slug) return { success: false };

    try {
      await tenantsService.upgradeTenant(user.tenant_slug);
      updateUser({ subscription_plan: 'pro' });
      await loadTenantInfo();
      toast.success('Successfully upgraded to Pro plan!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Upgrade failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    if (user) {
      loadTenantInfo();
      if (user.role === 'admin') {
        loadTenantStats();
      }
    }
  }, [user]);

  return {
    tenantInfo,
    stats,
    loading,
    loadTenantInfo,
    loadTenantStats,
    upgradeTenant
  };
};