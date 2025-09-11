import React from 'react';
import { clsx } from 'clsx';

const Input = ({
  label,
  error,
  className = '',
  required = false,
  ...props
}) => {
  const inputClasses = clsx(
    'input',
    {
      'border-danger-300 focus:border-danger-500 focus:ring-danger-500': error,
    },
    className
  );

  return (
    <div className="mb-4">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};

export default Input;