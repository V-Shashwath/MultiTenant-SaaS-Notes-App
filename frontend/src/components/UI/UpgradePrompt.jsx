import React from 'react';
import { AlertTriangle, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';
import Card from './Card';

const UpgradePrompt = ({ onUpgrade, upgrading, noteCount = 0 }) => {
  const { user, isAdmin } = useAuth();
  
  if (user?.subscription_plan !== 'free') return null;

  const isAtLimit = noteCount >= 3;
  
  return (
    <Card className="border-amber-200 bg-amber-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {isAtLimit ? (
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          ) : (
            <Crown className="h-6 w-6 text-amber-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800">
                {isAtLimit 
                  ? 'Note Limit Reached!' 
                  : 'Upgrade to Pro for Unlimited Notes'
                }
              </h3>
              
              <div className="mt-2 text-sm text-amber-700">
                {isAtLimit ? (
                  <p>
                    You've reached the 3-note limit for the free plan. 
                    Upgrade to Pro to create unlimited notes and unlock premium features.
                  </p>
                ) : (
                  <div>
                    <p className="mb-2">
                      You're using {noteCount} of 3 free notes. 
                      Upgrade to Pro for unlimited notes and advanced features.
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span>✓ Unlimited notes</span>
                      <span>✓ Advanced features</span>
                      <span>✓ Priority support</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {isAdmin && (
              <div className="ml-4 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={onUpgrade}
                  loading={upgrading}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {upgrading ? 'Upgrading...' : 'Upgrade Now'}
                  {!upgrading && <ArrowRight className="ml-1 h-3 w-3" />}
                </Button>
              </div>
            )}
          </div>
          
          {!isAdmin && isAtLimit && (
            <div className="mt-3 p-2 bg-amber-100 rounded text-xs text-amber-800">
              Contact your admin to upgrade to Pro plan
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UpgradePrompt;