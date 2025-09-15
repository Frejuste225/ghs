import React from 'react';
import { clsx } from 'clsx';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info,
  X 
} from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  title, 
  children, 
  onClose,
  className = '',
  ...props 
}) => {
  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    danger: XCircle,
    info: Info,
  };

  const Icon = icons[type];

  const typeClasses = {
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    danger: 'bg-danger-50 border-danger-200 text-danger-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800',
  };

  const iconClasses = {
    success: 'text-success-400',
    warning: 'text-warning-400',
    danger: 'text-danger-400',
    info: 'text-primary-400',
  };

  return (
    <div
      className={clsx(
        'rounded-md border p-4',
        typeClasses[type],
        className
      )}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={clsx('w-5 h-5', iconClasses[type])} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={clsx(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'hover:bg-opacity-20 hover:bg-gray-600',
                  iconClasses[type]
                )}
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;