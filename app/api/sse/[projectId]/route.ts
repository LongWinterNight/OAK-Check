import { subscribe } from '@/lib/sse/emitter';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

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

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(': ping\n\n'));

      const unsubscribe = subscribe(projectId, controller);

      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keepalive\n\n'));
        } catch {
          clearInterval(interval);
          unsubscribe();
        }
      }, 25_000);

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
