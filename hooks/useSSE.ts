'use client';

import { useEffect, useRef } from 'react';
import type { SSEEvent } from '@/lib/sse/emitter';

type Handler = (event: SSEEvent) => void;

export function useSSE(projectId: string | null | undefined, onEvent: Handler) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!projectId) return;

    let es: EventSource | null = null;
    let retryDelay = 1000;
    let destroyed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (destroyed) return;
      es = new EventSource(`/api/sse/${projectId}`);

      es.onopen = () => {
        retryDelay = 1000;
      };

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data) as SSEEvent;
          handlerRef.current(event);
        } catch {
          // ignore malformed messages
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
  }, [projectId]);
}
