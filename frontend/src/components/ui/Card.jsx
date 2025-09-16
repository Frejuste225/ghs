import React from 'react';
import { clsx } from 'clsx';

const Card = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  actions,
  hover = false,
  padding = true,
  ...props 
}) => {
  return (
    <div 
      className={clsx(
        'card',
        {
          'card-hover': hover,
          'p-0': !padding,
        },
        className
      )} 
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className={clsx(
          'flex items-center justify-between mb-4',
          !padding && 'px-6 pt-6'
        )}>
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
      <div className={clsx(!padding && 'px-6 pb-6')}>
        {children}
      </div>
    </div>
  );
};

export default Card;