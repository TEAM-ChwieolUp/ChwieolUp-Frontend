'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LOGIN_ROUTE } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  useEffect(() => {
    if (!isBootstrapped) {
      return;
    }

    if (status === 'anonymous') {
      router.replace(LOGIN_ROUTE);
    }
  }, [isBootstrapped, router, status]);

  if (!isBootstrapped || status === 'bootstrapping') {
    return null;
  }

  if (status !== 'authenticated') {
    return null;
  }

  return <>{children}</>;
}
