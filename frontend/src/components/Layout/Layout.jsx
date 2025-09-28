import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Building2, 
  FileText, 
  BarChart3, 
  LogOut, 
  User,
  Crown 
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, subscriptionPlan } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, current: window.location.pathname === '/dashboard' },
    { name: 'Notes', href: '/notes', icon: FileText, current: window.location.pathname === '/notes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  {user?.tenant_name}
                </span>
                {subscriptionPlan === 'pro' && (
                  <Crown className="h-5 w-5 text-yellow-500 ml-2" />
                )}
              </div>
              
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <div className="font-medium">{user?.email}</div>
                <div className="text-xs text-gray-500">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </div>
              </div>
              
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;