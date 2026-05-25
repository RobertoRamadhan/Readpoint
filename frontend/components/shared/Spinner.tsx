import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'white';
  className?: string;
  label?: string;
}

export default function Spinner({ 
  size = 'md', 
  variant = 'primary',
  className = '',
  label
}: SpinnerProps) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    accent: 'text-accent-600',
    white: 'text-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg 
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[variant]}`}
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4" 
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
        />
      </svg>
      {label && <p className="text-secondary-600 text-sm font-medium">{label}</p>}
    </div>
  );
}

export function LoadingOverlay({ 
  isLoading, 
  label = 'Loading...' 
}: { 
  isLoading: boolean; 
  label?: string 
}) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-2xl">
        <Spinner size="lg" label={label} />
      </div>
    </div>
  );
}

export function SkeletonLoader({ 
  count = 3, 
  className = '' 
}: { 
  count?: number; 
  className?: string 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-secondary-200 rounded-lg h-12 animate-pulse" />
      ))}
    </div>
  );
}
