'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { setUser } from '@/lib/auth';
import type { UserProfile } from '@/lib/types';
import UserAvatar from '@/components/UserAvatar';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registeredUser, setRegisteredUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setRegisteredUser(null);
    setLoading(true);
    try {
      const data = await api.register(email, password);
      setSuccess(data.message);
      if (data.user) {
        setRegisteredUser(data.user);
        setUser(data.user);
      }
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-brand text-4xl">Epifi Share</h1>
      <p className="mt-1 text-sm text-zinc-500">Create an account</p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{' '}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>

      {registeredUser && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900 dark:bg-red-950/30">
          <UserAvatar user={registeredUser} size={80} className="border-4 border-red-500" />
          <p className="text-center text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Welcome, {registeredUser.email}!
          </p>
          <p className="text-center text-xs text-zinc-500">Your avatar is ready. Redirecting to login…</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        {success && !registeredUser && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
            {success}
          </p>
        )}
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password (min 6 chars)</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 py-2.5 font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
        >
          {loading ? 'Creating account…' : 'Register'}
        </button>
      </form>
    </div>
  );
}

function motion({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={className}>{children}</div>;
}
