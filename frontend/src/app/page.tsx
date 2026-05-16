'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) router.replace('/notes');
  }, [router]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-brand text-6xl text-zinc-900 dark:text-zinc-50">Epifi Share</h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        Share and save notes with friends — powered by your Express + MongoDB API.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/login"
          className="rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-xl border border-zinc-300 px-6 py-3 font-medium hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Register
        </Link>
      </div>
      <p className="mt-12 text-sm text-zinc-500">Demo: alice@test.com / password123</p>
    </div>
  );
}
