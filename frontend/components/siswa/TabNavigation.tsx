'use client';

import React from 'react';
import { Badge } from '@/components/shared';

interface TabNavigationProps {
  activeTab: 'overview' | 'ebooks' | 'rewards' | 'quizzes';
  onTabChange: (tab: 'overview' | 'ebooks' | 'rewards' | 'quizzes') => void;
  ebooksCount: number;
  rewardsCount: number;
  quizzesCount: number;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  ebooksCount,
  rewardsCount,
  quizzesCount,
}: TabNavigationProps) {
  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'ebooks' as const, label: 'E-Books', icon: '📚', count: ebooksCount },
    { id: 'quizzes' as const, label: 'Kuis', icon: '❓', count: quizzesCount },
    { id: 'rewards' as const, label: 'Rewards', icon: '🎁', count: rewardsCount },
  ];

  return (
    <nav className="flex items-center gap-2 md:gap-3 w-full">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 md:gap-2
              px-3 py-2.5 md:px-4 md:py-3
              text-xs md:text-sm font-bold rounded-xl border-2
              transition-all duration-200
              hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98]
              ${isActive
                ? 'bg-amber-700 text-white border-amber-800 shadow-md shadow-amber-300/40'
                : 'bg-white text-amber-800 border-amber-200 hover:border-amber-500 hover:bg-amber-50'
              }
            `}
          >
            <span className="text-base md:text-lg">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== undefined && (
              <Badge
                variant={isActive ? 'secondary' : 'warning'}
                size="sm"
              >
                {tab.count}
              </Badge>
            )}
          </button>
        );
      })}
    </nav>
  );
}
