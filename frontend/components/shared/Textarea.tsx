'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

export default function Textarea({
  label,
  error,
  hint,
  size = 'md',
  fullWidth = true,
  showCharCount = false,
  maxLength,
  className = '',
  value,
  ...props
}: TextareaProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-24',
    md: 'px-4 py-2.5 text-base min-h-32',
    lg: 'px-5 py-3 text-lg min-h-40',
  };

  const textareaClasses = `w-full ${sizeClasses[size]} border-2 rounded-lg transition-all duration-200 resize-none ${
    error
      ? 'border-danger bg-danger bg-opacity-5 focus:border-danger focus:ring-2 focus:ring-danger focus:ring-opacity-10'
      : 'border-secondary-200 hover:border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
  } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary-50 bg-white text-secondary-900 placeholder-secondary-400`;

  const charCount = String(value || '').length;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="form-label">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <textarea
        className={`${textareaClasses} ${className}`}
        value={value}
        maxLength={maxLength}
        {...props}
      />

      <div className="flex items-center justify-between mt-1">
        <div>
          {error && (
            <p className="form-error flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 14.586l-6.687-6.687a1 1 0 00-1.414 1.414l8.1 8.1a1 1 0 001.414 0l8.1-8.1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}

          {hint && !error && (
            <p className="form-hint">
              {hint}
            </p>
          )}
        </div>

        {showCharCount && maxLength && (
          <span className={`text-xs font-medium ${
            charCount > maxLength * 0.9 ? 'text-warning' : 'text-secondary-500'
          }`}>
            {charCount} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
