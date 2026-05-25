'use client';

import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export default function Breadcrumb({
  items,
  separator = '/',
}: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <span className="text-secondary-400 mx-1">{separator}</span>
          )}
          {item.href && !item.active ? (
            <a
              href={item.href}
              className="text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200"
            >
              {item.label}
            </a>
          ) : (
            <span className={item.active ? 'text-secondary-900 font-medium' : 'text-secondary-600'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
