import React from 'react';
import { clsx } from 'clsx';

const Card = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  actions,
  ...props 
}) => {
  return (
    <div className={clsx('card', className)} {...props}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;