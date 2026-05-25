'use client';

import React from 'react';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: Option[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function Select({
  label,
  error,
  hint,
  options,
  placeholder = 'Select an option...',
  size = 'md',
  fullWidth = true,
  className = '',
  ...props
}: SelectProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const selectClasses = `w-full ${sizeClasses[size]} border-2 rounded-lg transition-all duration-200 appearance-none cursor-pointer ${
    error
      ? 'border-danger bg-danger bg-opacity-5 focus:border-danger focus:ring-2 focus:ring-danger focus:ring-opacity-10'
      : 'border-secondary-200 hover:border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
  } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary-50 bg-white text-secondary-900`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="form-label">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          className={`${selectClasses} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {error && (
        <p className="form-error flex items-center gap-1 mt-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 14.586l-6.687-6.687a1 1 0 00-1.414 1.414l8.1 8.1a1 1 0 001.414 0l8.1-8.1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="form-hint mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}
