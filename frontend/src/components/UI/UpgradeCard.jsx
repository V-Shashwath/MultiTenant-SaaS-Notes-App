import React from 'react';
import { Star, Check, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const UpgradeCard = ({ onUpgrade, upgrading }) => {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="h-6 w-6 text-yellow-300" />
            <h3 className="text-xl font-bold">Upgrade to Pro</h3>
          </div>
          
          <p className="text-blue-100 mb-4">
            Unlock unlimited notes and advanced features for your team.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-300" />
              <span className="text-sm">Unlimited notes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-300" />
              <span className="text-sm">Advanced features</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-300" />
              <span className="text-sm">Priority support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-300" />
              <span className="text-sm">Team collaboration</span>
            </div>
          </div>
        </div>
        
        <div className="ml-6">
          <button
            onClick={onUpgrade}
            disabled={upgrading}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            <span>{upgrading ? 'Upgrading...' : 'Upgrade Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeCard;