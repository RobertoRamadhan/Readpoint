'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function TestCRUD() {
  const { user, isAuthenticated } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      addLog(`✓ Authenticated as ${user.name} (${user.role})`);
    }
  }, [isAuthenticated, user]);

  const testGetUsers = async () => {
    try {
      addLog('Testing: GET /users');
      const response = await api.users.list();
      const count = Array.isArray(response.data) ? response.data.length : 0;
      addLog(`✓ GET /users: ${count} users`);
    } catch (err) {
      addLog(`✗ GET /users: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testGetEbooks = async () => {
    try {
      addLog('Testing: GET /ebooks');
      const response = await api.ebooks.list();
      const count = Array.isArray(response.data) ? response.data.length : 0;
      addLog(`✓ GET /ebooks: ${count} ebooks`);
    } catch (err) {
      addLog(`✗ GET /ebooks: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testGetRewards = async () => {
    try {
      addLog('Testing: GET /rewards');
      const response = await api.rewards.list();
      const count = Array.isArray(response.data) ? response.data.length : 0;
      addLog(`✓ GET /rewards: ${count} rewards`);
    } catch (err) {
      addLog(`✗ GET /rewards: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testCreateUser = async () => {
    try {
      addLog('Testing: POST /users/create');
      const response = await api.users.create({
        name: 'Test User ' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123',
        password_confirmation: 'TestPassword123',
        role: 'siswa',
        grade_level: '1',
      });
      addLog(`✓ POST /users/create: User ID ${response.data?.id}`);
    } catch (err) {
      addLog(`✗ POST /users/create: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testDeleteUser = async () => {
    try {
      addLog('Testing: DELETE /users/15');
      const response = await api.users.delete(15);
      addLog(`✓ DELETE /users/15: ${response.message}`);
    } catch (err) {
      addLog(`✗ DELETE /users/15: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testDeleteEbook = async () => {
    try {
      addLog('Testing: DELETE /ebooks/2');
      const response = await api.ebooks.delete(2);
      addLog(`✓ DELETE /ebooks/2: ${response.message}`);
    } catch (err) {
      addLog(`✗ DELETE /ebooks/2: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testDeleteReward = async () => {
    try {
      addLog('Testing: DELETE /rewards/2');
      const response = await api.rewards.delete(2);
      addLog(`✓ DELETE /rewards/2: ${response.message}`);
    } catch (err) {
      addLog(`✗ DELETE /rewards/2: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="p-8">Hanya admin yang bisa akses halaman ini</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Test CRUD Operations</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={testGetUsers}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          GET /users
        </button>
        <button
          onClick={testGetEbooks}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          GET /ebooks
        </button>
        <button
          onClick={testGetRewards}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          GET /rewards
        </button>
        <button
          onClick={testCreateUser}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          POST /users/create
        </button>
        <button
          onClick={testDeleteUser}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          DELETE /users/15
        </button>
        <button
          onClick={testDeleteEbook}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          DELETE /ebooks/2
        </button>
        <button
          onClick={testDeleteReward}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          DELETE /rewards/2
        </button>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}
