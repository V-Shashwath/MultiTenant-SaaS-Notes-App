import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const Alert = ({
  children,
  variant = 'info',
  dismissible = false,
  onDismiss,
  className,
  ...props
}) => {
  const baseClasses = 'rounded-lg p-4 flex items-start';
  
  const variants = {
    success: 'bg-green-50 border border-green-200 text-green-800',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border border-red-200 text-red-800',
    info: 'bg-blue-50 border border-blue-200 text-blue-800'
  };
  
  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
    info: Info
  };
  
  const Icon = icons[variant];
  
  return (
    <div className={clsx(baseClasses, variants[variant], className)} {...props}>
      <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
      
      <div className="flex-1">
        {children}
      </div>
      
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-4 flex-shrink-0 text-current opacity-60 hover:opacity-80"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;