'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api-client';
import Link from 'next/link';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleCheckHealth = async () => {
    setHealthLoading(true);
    try {
      const response = await apiCall<HealthStatus>('/health', { skipAuth: true });
      if (response.success) {
        setHealthStatus(response.data || null);
      }
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            VogueVault
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Info Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
              Welcome, {user.name || user.email}
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Email</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">{user.email}</p>
              </div>

              {user.name && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">{user.name}</p>
                </div>
              )}

              {user.id && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">User ID</p>
                  <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all">{user.id}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-6 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* API Health Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
              API Status
            </h2>

            {healthStatus ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Status</p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></span>
                    {healthStatus.status}
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Uptime (seconds)</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {Math.floor(healthStatus.uptime)}
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Last Check</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 break-all">
                    {new Date(healthStatus.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Click below to check the backend API health status
              </p>
            )}

            <button
              onClick={handleCheckHealth}
              disabled={healthLoading}
              className="w-full mt-6 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {healthLoading ? 'Checking...' : 'Check API Health'}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/"
            className="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Home</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Back to the homepage</p>
          </Link>

          <Link
            href="/products"
            className="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Products</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Browse fashion items</p>
          </Link>

          <Link
            href="/recommendations"
            className="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Aurora AI</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Get outfit recommendations</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
