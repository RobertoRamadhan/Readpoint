'use client';

import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  action?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function Header({ 
  title = 'Readpoint', 
  subtitle,
  logoUrl,
  action,
  breadcrumbs
}: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-secondary-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {breadcrumbs && (
          <nav className="flex items-center gap-2 mb-4 text-sm">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-secondary-400">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="text-primary-600 hover:text-primary-700 transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-secondary-600">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {logoUrl ? (
              <img src={logoUrl} alt={title} className="h-10 md:h-12" />
            ) : (
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-secondary-600 text-sm md:text-base mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
