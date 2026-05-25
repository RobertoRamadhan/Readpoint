'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'gradient';
  interactive?: boolean;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  border = true,
  shadow = 'md',
  variant = 'default',
  interactive = false,
}: CardProps) {
  const baseClasses = 'bg-white rounded-xl transition-all duration-300';
  
  const paddingClasses = {
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const variantClasses = {
    default: 'bg-white border border-secondary-200',
    elevated: 'bg-white border border-secondary-100 shadow-lg',
    outlined: 'bg-transparent border-2 border-secondary-300 hover:border-primary-400',
    filled: 'bg-secondary-50 border border-secondary-200',
    gradient: 'bg-gradient-to-br from-white to-secondary-50 border border-secondary-200'
  };

  const hoverClasses = hover || interactive 
    ? 'hover:shadow-lg hover:border-primary-300 hover:-translate-y-1 cursor-pointer' 
    : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    shadowClasses[shadow],
    hoverClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className = '',
  title,
  subtitle,
  icon
}: { 
  children?: React.ReactNode; 
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`mb-4 flex items-start gap-3 ${className}`}>
      {icon && <div className="flex-shrink-0 text-primary-600">{icon}</div>}
      <div className="flex-1">
        {title && <h3 className="card-title">{title}</h3>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export function CardContent({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={`text-secondary-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className = '',
  divider = true
}: { 
  children: React.ReactNode; 
  className?: string;
  divider?: boolean;
}) {
  return (
    <div className={`mt-4 ${divider ? 'pt-4 border-t border-secondary-200' : ''} ${className}`}>
      {children}
    </div>
  );
}
