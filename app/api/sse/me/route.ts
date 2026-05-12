import { subscribe } from '@/lib/sse/emitter';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// Глобальный SSE-канал на пользователя. Доставляет события вида user:*
// (например, мгновенное обновление роли после смены админом). Mount-ится
// один раз в Providers и держится пока вкладка открыта.
const MAX_CONNECTION_MS = 10 * 60_000; // 10 min — EventSource переподключится сам

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Не авторизован' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = session.user.id as string;

  let keepalive: ReturnType<typeof setInterval> | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(': ping\n\n'));

      // projectId = null означает «глобальный пользовательский канал»
      unsubscribe = subscribe(null, controller, userId);

      keepalive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keepalive\n\n'));
        } catch {
          cleanup();
        }
      }, 25_000);

      timeout = setTimeout(() => {
        try { controller.close(); } catch { /* already closed */ }
        cleanup();
      }, MAX_CONNECTION_MS);

      req.signal?.addEventListener('abort', () => {
        cleanup();
      });
    },
    cancel() {
      cleanup();
    },
  });

  function cleanup() {
    if (keepalive !== undefined) { clearInterval(keepalive); keepalive = undefined; }
    if (timeout !== undefined) { clearTimeout(timeout); timeout = undefined; }
    unsubscribe?.();
    unsubscribe = undefined;
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
