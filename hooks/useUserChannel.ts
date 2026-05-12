'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { SSEEvent } from '@/lib/sse/emitter';

// Подписка на user-scoped SSE-канал /api/sse/me. Сейчас реагирует на
// смену роли — заставляет NextAuth перетянуть свежий JWT из БД,
// чтобы UI и server-guard'ы тут же видели новую роль без релогина.
export function useUserChannel() {
  const { data: session, update, status } = useSession();
  const updateRef = useRef(update);
  updateRef.current = update;

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;

    let es: EventSource | null = null;
    let retryDelay = 1000;
    let destroyed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (destroyed) return;
      es = new EventSource(`/api/sse/me`);

      es.onopen = () => {
        retryDelay = 1000;
      };

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data) as SSEEvent;
          if (event.type === 'user:role-changed') {
            // trigger='update' в jwt-callback заставит сразу перечитать роль из БД
            updateRef.current?.();
          }
        } catch {
          // ignore malformed
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (!destroyed) {
          retryTimer = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 30_000);
            connect();
          }, retryDelay);
        }
      };
    };

    connect();

    return () => {
      destroyed = true;
      if (retryTimer !== null) clearTimeout(retryTimer);
      es?.close();
    };
  }, [status, session?.user?.id]);
}
