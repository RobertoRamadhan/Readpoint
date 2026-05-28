'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/shared';

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  stock: number;
  image_url?: string;
  image?: string;
}

interface RewardGridProps {
  rewards: Reward[];
  userPoints: number;
  loading?: boolean;
  onRedeem: (rewardId: number) => void;
}

export default function RewardGrid({ rewards, userPoints, loading, onRedeem }: RewardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-40 bg-gray-200 rounded-t-lg mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl p-12 text-center border-2 border-gray-300">
        <p className="text-gray-800 font-black text-lg">🎁 Belum ada rewards tersedia</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rewards.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          userPoints={userPoints}
          onRedeem={onRedeem}
        />
      ))}
    </div>
  );
}

function RewardCard({ reward, userPoints, onRedeem }: { 
  reward: Reward; 
  userPoints: number; 
  onRedeem: (rewardId: number) => void;
}) {
  const canRedeem = reward.stock > 0 && userPoints >= reward.points_required;
  const [imageError, setImageError] = useState(false);

  // Ensure image is a full URL
  const getImageUrl = () => {
    if (!reward.image_url) return null;
    
    // If already a full URL, return as is
    if (reward.image_url.startsWith('http')) {
      return reward.image_url;
    }
    
    // If it's a relative path, construct full URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://readpoint-backend-main-odr7ck.laravel.cloud';
    return `${baseUrl}/storage/${reward.image_url}`;
  };

  const imageUrl = getImageUrl();

  return (
    <Card hover className="overflow-hidden group">
      <div className="h-40 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center text-6xl relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={reward.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('[RewardCard] Image failed to load:', imageUrl);
              setImageError(true);
            }}
            loading="lazy"
          />
        ) : (
          <span>🎁</span>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="font-black text-gray-900 mb-3 text-lg">{reward.name}</h3>
        <p className="text-sm text-gray-700 font-semibold mb-5 line-clamp-2">{reward.description}</p>
        
        <div className="space-y-3 text-sm mb-6">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
            <span className="text-gray-800 font-black">💰 Cost</span>
            <span className="font-black text-purple-700">{reward.points_required} pts</span>
          </div>
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
            <span className="text-gray-800 font-black">📦 Stock</span>
            <span className="font-black text-gray-900">{reward.stock} left</span>
          </div>
        </div>

        <Button
          onClick={() => onRedeem(reward.id)}
          disabled={!canRedeem}
          className={`w-full ${
            canRedeem
              ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {reward.stock <= 0 ? '❌ Out of Stock' : '✨ Redeem'}
        </Button>
      </div>
    </Card>
  );
}
