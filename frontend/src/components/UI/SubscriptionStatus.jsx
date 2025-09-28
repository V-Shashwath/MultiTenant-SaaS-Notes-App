import React from 'react';
import { Crown, Users, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Badge from './Badge';
import Card from './Card';

const SubscriptionStatus = ({ noteCount, userCount, onUpgrade, upgrading }) => {
  const { user, isAdmin } = useAuth();
  
  const isPro = user?.subscription_plan === 'pro';
  const isAtLimit = !isPro && noteCount >= 3;
  
  return (
    <Card className={`${isPro ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${isPro ? 'bg-yellow-200' : 'bg-gray-200'}`}>
            {isPro ? (
              <Crown className="h-6 w-6 text-yellow-600" />
            ) : (
              <FileText className="h-6 w-6 text-gray-600" />
            )}
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.tenant_name}
              </h3>
              <Badge 
                variant={isPro ? 'warning' : 'default'}
                className="flex items-center space-x-1"
              >
                {isPro && <Crown className="h-3 w-3" />}
                <span>{isPro ? 'Pro Plan' : 'Free Plan'}</span>
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>
                  {noteCount} {isPro ? 'notes' : `/ 3 notes`}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{userCount} users</span>
              </div>
            </div>
          </div>
        </div>
        
        {!isPro && isAdmin && (
          <div className="text-right">
            <button
              onClick={onUpgrade}
              disabled={upgrading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
            </button>
            
            {isAtLimit && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                Note limit reached!
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SubscriptionStatus;