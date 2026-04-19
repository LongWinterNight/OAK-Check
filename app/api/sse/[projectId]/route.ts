import { subscribe } from '@/lib/sse/emitter';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const stream = new ReadableStream({
    start(controller) {
      // Пинг при подключении
      const ping = new TextEncoder().encode(': ping\n\n');
      controller.enqueue(ping);

      const unsubscribe = subscribe(projectId, controller);

      // Периодический keepalive (каждые 25 сек)
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keepalive\n\n'));
        } catch {
          clearInterval(interval);
          unsubscribe();
        }
      }, 25_000);

      // Cleanup при закрытии соединения
      return () => {
        clearInterval(interval);
        unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
