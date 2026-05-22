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
    { id: 'overview' as const, label: 'Overview', icon: '📊', count: undefined },
    { id: 'ebooks' as const, label: 'E-Books', icon: '📚', count: ebooksCount },
    { id: 'quizzes' as const, label: 'Kuis', icon: '🎯', count: quizzesCount },
    { id: 'rewards' as const, label: 'Rewards', icon: '🎁', count: rewardsCount },
  ];

  return (
    <nav className="grid w-full grid-cols-2 gap-3 rounded-[2rem] border border-[#E6D8B8] bg-white/80 p-3 shadow-sm backdrop-blur md:grid-cols-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`group flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-black transition-all duration-200 active:scale-[0.98] md:px-4 md:py-4 ${
              isActive
                ? 'bg-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/20'
                : 'bg-[#FAF3E0] text-[#1E3A5F] hover:-translate-y-0.5 hover:bg-white hover:shadow-md'
            }`}
          >
            <span className="text-lg md:text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <Badge
                variant={isActive ? 'secondary' : 'warning'}
                size="sm"
                className={isActive ? 'border-white/20 bg-white/15 text-white' : 'border-[#E6D8B8] bg-white text-[#2E7D32]'}
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
