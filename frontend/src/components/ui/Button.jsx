import React from 'react';
import { clsx } from 'clsx';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) => {
  const baseClasses = 'btn micro-bounce focus-ring';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    warning: 'btn-warning',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      'opacity-50 cursor-not-allowed': disabled || loading,
      'cursor-wait': loading,
      'w-full': fullWidth,
    },
    className
  );

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size="sm" 
          color={variant === 'primary' ? 'white' : 'primary'} 
          className="mr-2" 
        />
      )}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-4 h-4 mr-2" />
      )}
      {children}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-4 h-4 ml-2" />
      )}
    </button>
  );
};

export default Button;