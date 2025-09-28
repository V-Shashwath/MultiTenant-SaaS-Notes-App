import React from 'react';
import { AlertCircle, Crown, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';

const LimitReachedBanner = ({ onUpgrade, upgrading, onDismiss, noteCount }) => {
  const { user, isAdmin } = useAuth();
  
  if (user?.subscription_plan === 'pro' || noteCount < 3) return null;
  
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Free Plan Limit Reached
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              You've reached the maximum of 3 notes for the free plan. 
              {isAdmin 
                ? ' Upgrade to Pro to create unlimited notes.'
                : ' Ask your admin to upgrade to Pro for unlimited notes.'
              }
            </p>
          </div>
          
          {isAdmin && (
            <div className="mt-4">
              <Button
                size="sm"
                onClick={onUpgrade}
                loading={upgrading}
                className="bg-red-600 hover:bg-red-700"
                icon={Crown}
              >
                Upgrade to Pro Now
              </Button>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LimitReachedBanner;