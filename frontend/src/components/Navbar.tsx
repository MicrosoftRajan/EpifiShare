'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { clearToken, getUser, isLoggedIn, setUser as saveUser } from '@/lib/auth';
import type { UserProfile } from '@/lib/types';
import UserAvatar from '@/components/UserAvatar';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isLoggedIn()) {
        setLoggedIn(false);
        setUser(null);
        return;
      }
      setLoggedIn(true);
      const cached = getUser();
      if (cached) {
        setUser(cached);
        return;
      }
      try {
        const profile = await api.getMe();
        saveUser(profile);
        setUser(profile);
      } catch {
        setUser(null);
      }
    };
    load();
  }, [pathname]);

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    clearToken();
    setLoggedIn(false);
    setUser(null);
    router.push('/login');
  }

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link
          href={loggedIn ? '/notes' : '/'}
          className="font-brand text-3xl leading-none text-zinc-900 dark:text-zinc-100"
        >
          Epifi Share
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {loggedIn && user ? (
            <UserAvatar
              user={user}
              size={40}
              onClick={handleLogout}
              title="Click to logout"
            />
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
