'use client';

import React from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  closeable?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
  closeable = true,
  icon,
  className = '',
}: AlertProps) {
  const typeConfig = {
    success: {
      bg: 'bg-primary-50',
      border: 'border-primary-200',
      text: 'text-primary-800',
      icon: '✓',
      color: 'text-primary-600',
    },
    error: {
      bg: 'bg-danger bg-opacity-5',
      border: 'border-danger border-opacity-30',
      text: 'text-danger',
      icon: '✕',
      color: 'text-danger',
    },
    warning: {
      bg: 'bg-warning bg-opacity-5',
      border: 'border-warning border-opacity-30',
      text: 'text-warning',
      icon: '!',
      color: 'text-warning',
    },
    info: {
      bg: 'bg-accent-50',
      border: 'border-accent-200',
      text: 'text-accent-800',
      icon: 'ℹ',
      color: 'text-accent-600',
    },
  };

  const config = typeConfig[type];

  return (
    <div className={`${config.bg} border-l-4 ${config.border} ${config.text} px-4 py-4 rounded-lg flex items-start gap-3 ${className}`}>
      {icon ? (
        <div className={`flex-shrink-0 ${config.color}`}>{icon}</div>
      ) : (
        <div className={`flex-shrink-0 font-bold text-lg ${config.color}`}>{config.icon}</div>
      )}
      
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>

      {closeable && onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${config.color} hover:opacity-70 transition-opacity`}
          aria-label="Close alert"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function AlertContainer({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
}
