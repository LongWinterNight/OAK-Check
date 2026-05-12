'use client';

import { useEffect } from 'react';

/**
 * Клиентский heartbeat — пингует /api/users/me/heartbeat каждые 60 сек
 * пока вкладка открыта. Сервер обновляет online + lastSeenAt пользователя.
 *
 * Подключается в Providers — работает на всех страницах после login.
 * Пропускает запрос если document.hidden (вкладка в фоне) — не тратим
 * сеть когда пользователь не активен.
 */
export function useHeartbeat() {
  useEffect(() => {
    const send = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetch('/api/users/me/heartbeat', { method: 'POST' }).catch(() => {
        // молча — это вспомогательная фича
      });
    };

    // Первый пинг сразу при mount (если пользователь только что зашёл)
    send();

    // Затем каждые 60 секунд
    const id = window.setInterval(send, 60_000);

    // Дополнительный пинг при возврате к вкладке после фона
    const onVisibility = () => {
      if (!document.hidden) send();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
}
