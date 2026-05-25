'use client';

import React from 'react';
import Card from './Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  loading?: boolean;
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle,
  icon, 
  change, 
  color = 'primary', 
  loading = false,
  trend,
  onClick
}: StatsCardProps) {
  const colorClasses = {
    primary: 'from-primary-400 to-primary-600',
    secondary: 'from-secondary-400 to-secondary-600',
    accent: 'from-accent-400 to-accent-600',
    success: 'from-primary-400 to-primary-600',
    warning: 'from-warning to-emerald-600',
    danger: 'from-danger to-red-600'
  };

  const changeColorClasses = {
    increase: 'text-primary-600',
    decrease: 'text-danger'
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
            <div className="w-12 h-12 bg-secondary-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-secondary-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-secondary-200 rounded w-1/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <div 
      className={`card ${
        onClick ? 'hover:shadow-lg hover:border-primary-300 hover:-translate-y-1 cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-secondary-500">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-xl flex-shrink-0 ml-3`}>
              {icon}
            </div>
          )}
        </div>
        
        <div className="mb-3">
          <p className="text-3xl md:text-4xl font-bold text-secondary-900">{value}</p>
        </div>
        
        {(change || trend) && (
          <div className="flex items-center gap-2 pt-3 border-t border-secondary-100">
            {change && (
              <>
                <span className={`text-sm font-semibold ${changeColorClasses[change.type]}`}>
                  {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
                </span>
                <span className="text-xs text-secondary-500">{change.period}</span>
              </>
            )}
            {trend && !change && (
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-primary-600' : trend === 'down' ? 'text-danger' : 'text-secondary-600'
              }`}>
                {trend === 'up' ? '📈 Trending up' : trend === 'down' ? '📉 Trending down' : '➡️ Stable'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
