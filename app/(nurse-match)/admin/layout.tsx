'use client';

import { useEffect, useState } from 'react';
import { verifyPassword, isDemoUnlockedClient } from '@/lib/demoAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const unlocked = isDemoUnlockedClient('nurse-match');
    setIsUnlocked(unlocked);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);
    const result = await verifyPassword('nurse-match', password);
    setIsVerifying(false);
    if (result.success) {
      setIsUnlocked(true);
    } else {
      setError(result.error || 'Incorrect password');
      setPassword('');
    }
  };

  if (isUnlocked === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white">Admin Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Nurse Match Management</p>
          </div>

          {/* Login Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username (display only) */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                  Username
                </label>
                <input
                  type="text"
                  value="admin"
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 text-sm cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoFocus
                  disabled={isVerifying}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                {error && (
                  <p className="mt-1.5 text-xs text-red-400">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!password || isVerifying}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium transition-colors mt-2"
              >
                {isVerifying ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-700 mt-6">
            Achieve Nurse Match · Admin Access
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
