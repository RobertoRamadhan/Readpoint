'use client';

import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export default function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const tabClasses = {
    default: {
      container: 'flex gap-1 border-b border-secondary-200 bg-white rounded-t-lg',
      tab: 'px-4 py-3 font-medium text-secondary-700 border-b-2 border-transparent hover:text-secondary-900 transition-colors duration-200',
      active: 'border-b-2 border-primary-600 text-primary-600',
    },
    pills: {
      container: 'flex gap-2 p-1 bg-secondary-100 rounded-lg',
      tab: 'px-4 py-2 font-medium text-secondary-700 rounded-md transition-all duration-200 hover:bg-secondary-200',
      active: 'bg-white text-primary-600 shadow-sm',
    },
    underline: {
      container: 'flex gap-6 border-b border-secondary-200',
      tab: 'px-1 py-3 font-medium text-secondary-700 border-b-2 border-transparent hover:text-secondary-900 transition-colors duration-200',
      active: 'border-b-2 border-primary-600 text-primary-600',
    },
  };

  const styles = tabClasses[variant];

  return (
    <div className="w-full">
      <div className={styles.container}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''} flex items-center gap-2 whitespace-nowrap`}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`animate-fade-in ${activeTab === tab.id ? 'block' : 'hidden'}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
