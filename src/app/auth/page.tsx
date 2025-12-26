'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await register(email, password, name);
      }

      if (success) {
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            VogueVault
          </h1>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-900 dark:text-white mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Jane Doe"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-900 dark:text-white mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-900 dark:text-white mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              Demo credentials (if available):
            </p>
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Email: demo@voguevault.com | Password: demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
