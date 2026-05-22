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
    <nav className="grid w-full grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all md:py-4 ${
              isActive
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-300/60'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:shadow-md'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-black ${isActive ? 'bg-white/15 text-white' : 'bg-white text-emerald-700'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
