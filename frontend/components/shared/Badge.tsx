'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  dot = false,
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700 border border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-700 border border-secondary-200',
    accent: 'bg-accent-100 text-accent-700 border border-accent-200',
    success: 'bg-primary-100 text-primary-700 border border-primary-200',
    warning: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-30',
    danger: 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-30',
    info: 'bg-accent-100 text-accent-700 border border-accent-200',
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2.5',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {dot && <span className={`w-2 h-2 rounded-full ${variant === 'primary' ? 'bg-primary-600' : variant === 'secondary' ? 'bg-secondary-600' : 'bg-accent-600'}`} />}
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export function StatusBadge({ 
  status 
}: { 
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'active' | 'inactive' | 'in_progress' | 'failed' 
}) {
  const statusConfig = {
    pending: { variant: 'warning' as const, text: 'Pending', dot: true },
    approved: { variant: 'success' as const, text: 'Approved', dot: true },
    rejected: { variant: 'danger' as const, text: 'Rejected', dot: true },
    completed: { variant: 'success' as const, text: 'Completed', dot: true },
    active: { variant: 'success' as const, text: 'Active', dot: true },
    inactive: { variant: 'secondary' as const, text: 'Inactive', dot: true },
    in_progress: { variant: 'accent' as const, text: 'In Progress', dot: true },
    failed: { variant: 'danger' as const, text: 'Failed', dot: true },
  };

  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} dot={config.dot}>
      {config.text}
    </Badge>
  );
}
