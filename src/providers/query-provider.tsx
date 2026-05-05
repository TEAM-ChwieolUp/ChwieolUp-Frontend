'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { bootstrapSession, LOGIN_ROUTE } from '@/lib/api';
import { getQueryClient } from '@/lib/query/query-client';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const queryClient = getQueryClient();

  useEffect(() => {
    if (pathname === LOGIN_ROUTE) {
      return;
    }

    void bootstrapSession();
  }, [pathname]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
