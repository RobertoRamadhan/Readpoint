'use client';

import React from 'react';
import { Badge } from '@/components/shared';

interface HistoryTabsProps {
  activeTab: 'points' | 'quiz' | 'activity';
  onTabChange: (tab: 'points' | 'quiz' | 'activity') => void;
  counts: {
    points: number;
    quiz: number;
    activity: number;
  };
}

export default function HistoryTabs({ activeTab, onTabChange, counts }: HistoryTabsProps) {
  const tabs = [
    { id: 'points' as const, label: 'Points History', icon: '💰', count: counts.points },
    { id: 'quiz' as const, label: 'Quiz History', icon: '📝', count: counts.quiz },
    { id: 'activity' as const, label: 'Reading Activity', icon: '📚', count: counts.activity },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2
              px-4 py-3 text-sm font-bold rounded-xl border-2
              transition-all duration-200
              hover:scale-[1.02] active:scale-[0.98]
              ${isActive
                ? 'bg-amber-700 text-white border-amber-800 shadow-md shadow-amber-300/30'
                : 'bg-white text-amber-800 border-amber-200 hover:border-amber-500 hover:bg-amber-50'
              }
            `}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <Badge variant={isActive ? 'secondary' : 'warning'} size="sm">
                {tab.count}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
