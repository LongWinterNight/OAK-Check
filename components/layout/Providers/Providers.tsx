'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { useUserChannel } from '@/hooks/useUserChannel';

// Heartbeat запускается только если пользователь залогинен —
// иначе ping будет фейлиться с 401.
function HeartbeatRunner() {
  const { status } = useSession();
  useHeartbeat();
  return status === 'authenticated' ? null : null;
}

// User-scoped SSE: мгновенно реагирует на user:role-changed и подобные
// глобальные события (смена роли, бан и т.п.).
function UserChannelRunner() {
  useUserChannel();
  return null;
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
        <UserChannelRunner />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
