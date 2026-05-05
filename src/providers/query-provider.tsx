'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { AUTH_CALLBACK_ROUTE, bootstrapSession } from '@/lib/api';
import { getQueryClient } from '@/lib/query/query-client';
import { useAuthStore } from '@/store/auth-store';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const queryClient = getQueryClient();
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  useEffect(() => {
    if (pathname === AUTH_CALLBACK_ROUTE || isBootstrapped) {
      return;
    }

    void bootstrapSession();
  }, [isBootstrapped, pathname]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
