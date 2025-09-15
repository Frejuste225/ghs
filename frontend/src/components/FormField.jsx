import React from 'react';

const FormField = ({
  label,
  name,
  type = 'text',
  register,
  error,
  required = false,
  placeholder,
  options = [],
  className = '',
  ...props
}) => {
  const baseInputClasses = `
    mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
    focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
    transition-colors duration-200
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
  `;

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            {...register(name, { required })}
            className={baseInputClasses}
            {...props}
          >
            <option value="">{placeholder || `Sélectionner ${label.toLowerCase()}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            {...register(name, { required })}
            placeholder={placeholder}
            className={`${baseInputClasses} resize-none`}
            rows={4}
            {...props}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            {...register(name, { required })}
            className={baseInputClasses}
            {...props}
          />
        );
      
      case 'time':
        return (
          <input
            type="time"
            {...register(name, { required })}
            className={baseInputClasses}
            {...props}
          />
        );
      
      default:
        return (
          <input
            type={type}
            {...register(name, { required })}
            placeholder={placeholder}
            className={baseInputClasses}
            {...props}
          />
        );
    }
  };

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error.message || `${label} est requis`}
        </p>
      )}
    </div>
  );
};

export default FormField;