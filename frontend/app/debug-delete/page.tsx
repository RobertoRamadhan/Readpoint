'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function DebugDelete() {
  const { user, isAuthenticated } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      addLog(`✓ Authenticated as ${user.name}`);
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      addLog('Loading ebooks...');
      const ebooksRes = await api.ebooks.list();
      setEbooks(ebooksRes.data || []);
      addLog(`✓ Loaded ${(ebooksRes.data || []).length} ebooks`);

      addLog('Loading rewards...');
      const rewardsRes = await api.rewards.list();
      setRewards(rewardsRes.data || []);
      addLog(`✓ Loaded ${(rewardsRes.data || []).length} rewards`);

      addLog('Loading users...');
      const usersRes = await api.users.list();
      setUsers(usersRes.data || []);
      addLog(`✓ Loaded ${(usersRes.data || []).length} users`);
    } catch (err) {
      addLog(`✗ Error loading data: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  const deleteEbook = async (id: number) => {
    try {
      addLog(`Deleting ebook ${id}...`);
      const result = await api.ebooks.delete(id);
      addLog(`✓ Deleted ebook: ${result.message}`);
      loadData();
    } catch (err) {
      addLog(`✗ Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  const deleteReward = async (id: number) => {
    try {
      addLog(`Deleting reward ${id}...`);
      const result = await api.rewards.delete(id);
      addLog(`✓ Deleted reward: ${result.message}`);
      loadData();
    } catch (err) {
      addLog(`✗ Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      addLog(`Deleting user ${id}...`);
      const result = await api.users.delete(id);
      addLog(`✓ Deleted user: ${result.message}`);
      loadData();
    } catch (err) {
      addLog(`✗ Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="p-8">Hanya admin yang bisa akses halaman ini</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Debug Delete Operations</h1>

      <div className="grid grid-cols-3 gap-8 mb-8">
        {/* Ebooks */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">E-Books ({ebooks.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {ebooks.map(ebook => (
              <div key={ebook.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span className="text-sm">{ebook.title}</span>
                <button
                  onClick={() => deleteEbook(ebook.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Rewards ({rewards.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {rewards.map(reward => (
              <div key={reward.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span className="text-sm">{reward.name}</span>
                <button
                  onClick={() => deleteReward(reward.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Users */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Users ({users.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.map(user => (
              <div key={user.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span className="text-sm">{user.name}</span>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  disabled={user.id === 11} // Don't allow deleting Roberto
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}
