'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useHeartbeat } from '@/hooks/useHeartbeat';

// Heartbeat запускается только если пользователь залогинен —
// иначе ping будет фейлиться с 401.
function HeartbeatRunner() {
  const { status } = useSession();
  useHeartbeat();
  return status === 'authenticated' ? null : null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <HeartbeatRunner />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
