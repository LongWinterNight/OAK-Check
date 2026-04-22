import { subscribe } from '@/lib/sse/emitter';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

const MAX_CONNECTION_MS = 10 * 60_000; // 10 minutes — client reconnects automatically

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Не авторизован' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { projectId } = await params;

  let keepalive: ReturnType<typeof setInterval> | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(': ping\n\n'));

      unsubscribe = subscribe(projectId, controller);

      keepalive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keepalive\n\n'));
        } catch {
          cleanup();
        }
      }, 25_000);

      // Close after MAX_CONNECTION_MS — EventSource reconnects automatically.
      timeout = setTimeout(() => {
        try { controller.close(); } catch { /* already closed */ }
        cleanup();
      }, MAX_CONNECTION_MS);

      // Handle client disconnect via AbortSignal.
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
