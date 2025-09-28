import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { notesService, tenantsService, userService } from '../services';
import { 
  FileText, 
  Users, 
  Building2, 
  Crown, 
  TrendingUp,
  Calendar,
  Star,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import UpgradeCard from '../components/UI/UpgradeCard';
import SubscriptionStatus from '../components/UI/SubscriptionStatus';
import UserManagement from '../components/Users/UserManagement';

const DashboardPage = () => {
  const { user, isAdmin, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load tenant info
      if (user?.tenant_slug) {
        const tenantResponse = await tenantsService.getTenantInfo(user.tenant_slug);
        setTenantInfo(tenantResponse.data.tenant);
      }

      // Load stats if admin
      if (isAdmin && user?.tenant_slug) {
        const statsResponse = await tenantsService.getTenantStats(user.tenant_slug);
        setStats(statsResponse.data.stats);
        setRecentNotes(statsResponse.data.recent_notes);
        
        // Load user count
        const usersResponse = await userService.getTenantUsers();
        setUserCount(usersResponse.data.users.length);
      } else {
        // Load recent notes for regular users
        const notesResponse = await notesService.getAllNotes(1, 5);
        setRecentNotes(notesResponse.data.notes);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      await tenantsService.upgradeTenant(user.tenant_slug);
      
      // Update user context
      updateUser({ subscription_plan: 'pro' });
      
      // Reload dashboard data
      await loadDashboardData();
      
      toast.success('Successfully upgraded to Pro plan!');
    } catch (error) {
      const message = error.response?.data?.message || 'Upgrade failed';
      toast.error(message);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const isFreePlan = user?.subscription_plan === 'free';
  const noteCount = tenantInfo?.stats?.note_count || 0;
  const noteLimit = tenantInfo?.stats?.note_limit;
  const isAtLimit = isFreePlan && noteLimit && noteCount >= noteLimit;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.email}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.tenant_name} • {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.subscription_plan === 'pro' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user?.subscription_plan === 'pro' ? (
                <div className="flex items-center space-x-1">
                  <Crown className="h-4 w-4" />
                  <span>Pro Plan</span>
                </div>
              ) : (
                <span>Free Plan</span>
              )}
            </div>
            
            {isAdmin && isFreePlan && (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Star className="h-4 w-4" />
                <span>{upgrading ? 'Upgrading...' : 'Upgrade to Pro'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus 
        noteCount={noteCount}
        userCount={isAdmin ? userCount : stats?.total_users || 0}
        onUpgrade={handleUpgrade}
        upgrading={upgrading}
      />

      {/* Upgrade Card for Free Plan */}
      {isFreePlan && (
        <UpgradeCard onUpgrade={handleUpgrade} upgrading={upgrading} />
      )}

      {/* Admin Tabs */}
      {isAdmin && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>User Management</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Notes</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {noteCount}
                          {noteLimit && (
                            <span className="text-sm text-gray-500 ml-1">/ {noteLimit}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {isAtLimit && (
                      <div className="mt-2 text-sm text-amber-600 font-medium">
                        Note limit reached
                      </div>
                    )}
                  </div>

                  {stats && (
                    <>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Notes This Week</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.notes_this_week}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Notes Today</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.notes_today}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Recent Notes */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Recent Notes</h2>
                      <a
                        href="/notes"
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                      >
                        <span>View all</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {recentNotes.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
                        <p className="text-gray-600 mb-4">Create your first note to get started</p>
                        {!isAtLimit && (
                          <a
                            href="/notes"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Create Note</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentNotes.map((note) => (
                          <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 mb-1">{note.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {note.content || 'No content'}
                                </p>
                              </div>
                              <div className="text-xs text-gray-500 ml-4">
                                {new Date(note.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            {isAdmin && note.created_by && (
                              <div className="mt-2 text-xs text-gray-500">
                                Created by: {note.created_by}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <UserManagement />
            )}
          </div>
        </div>
      )}

      {/* Non-Admin View */}
      {!isAdmin && (
        <div className="space-y-6">
          {/* Stats Cards for Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Notes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recentNotes.length}
                    {isFreePlan && <span className="text-sm text-gray-500 ml-1">/ 3</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tenant</p>
                  <p className="text-lg font-bold text-gray-900">{user?.tenant_name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Notes for Members */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">My Recent Notes</h2>
                <a
                  href="/notes"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            <div className="p-6">
              {recentNotes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
                  <p className="text-gray-600 mb-4">Create your first note to get started</p>
                  {!isAtLimit && (
                    <a
                      href="/notes"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Create Note</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentNotes.map((note) => (
                    <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{note.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {note.content || 'No content'}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          {new Date(note.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tenant Info (Admin Only) */}
      {isAdmin && tenantInfo && activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tenant Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tenant Name</p>
              <p className="font-medium">{tenantInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tenant ID</p>
              <p className="font-medium">{tenantInfo.slug}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Subscription Plan</p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tenantInfo.subscription_plan === 'pro' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tenantInfo.subscription_plan === 'pro' ? 'Pro' : 'Free'}
                </span>
                {tenantInfo.subscription_plan === 'pro' && (
                  <Crown className="h-4 w-4 text-yellow-600" />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium">
                {new Date(tenantInfo.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;