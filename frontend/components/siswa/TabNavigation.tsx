'use client';

import React from 'react';

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
    { id: 'overview' as const, label: 'Overview', count: undefined },
    { id: 'ebooks' as const, label: 'E-Books', count: ebooksCount },
    { id: 'quizzes' as const, label: 'Kuis', count: quizzesCount },
    { id: 'rewards' as const, label: 'Rewards', count: rewardsCount },
  ];

  return (
    <nav className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-4 sm:gap-3 sm:rounded-3xl sm:p-4 lg:gap-4 lg:p-5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-black transition-all sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-3 sm:text-sm lg:px-4 lg:py-3.5 ${
              isActive
                ? 'bg-slate-900 text-white shadow-md shadow-slate-300/60'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:shadow-sm'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black sm:px-2 sm:py-1 sm:text-xs ${isActive ? 'bg-white/15 text-white' : 'bg-white text-emerald-700'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
