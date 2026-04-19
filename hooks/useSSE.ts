'use client';

import { useEffect, useRef } from 'react';
import type { SSEEvent } from '@/lib/sse/emitter';

type Handler = (event: SSEEvent) => void;

export function useSSE(projectId: string | null | undefined, onEvent: Handler) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!projectId) return;

    const es = new EventSource(`/api/sse/${projectId}`);

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as SSEEvent;
        handlerRef.current(event);
      } catch {
        // ignore malformed messages
      }
    };

    es.onerror = () => {
      // EventSource автоматически переподключается
    };

    return () => es.close();
  }, [projectId]);
}
