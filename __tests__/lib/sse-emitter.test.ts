import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { subscribe, broadcast, type SSEEvent } from '@/lib/sse/emitter';

/**
 * SSE-emitter — простой in-memory pub/sub. Тестируем:
 * - подписка/отписка
 * - broadcast только в правильный projectId
 * - cleanup умерших подписчиков
 */
describe('lib/sse/emitter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function makeController() {
    const enqueued: Uint8Array[] = [];
    const controller = {
      enqueue: vi.fn((data: Uint8Array) => enqueued.push(data)),
    } as unknown as ReadableStreamDefaultController;
    return { controller, enqueued };
  }

  it('broadcast доставляет события подписчикам того же projectId', () => {
    const a = makeController();
    const b = makeController();

    subscribe('proj1', a.controller, 'u1');
    subscribe('proj1', b.controller, 'u2');

    const event: SSEEvent = { type: 'comment:added', shotId: 's1', comment: { id: 'c1' } };
    broadcast('proj1', event);

    expect(a.controller.enqueue).toHaveBeenCalledTimes(1);
    expect(b.controller.enqueue).toHaveBeenCalledTimes(1);

    // Формат: data: <json>\n\n
    const decoder = new TextDecoder();
    const text = decoder.decode(a.enqueued[0]);
    expect(text).toMatch(/^data: /);
    expect(text).toMatch(/\n\n$/);
    expect(text).toContain('"type":"comment:added"');
  });

  it('broadcast НЕ доставляет в другой projectId', () => {
    const proj1 = makeController();
    const proj2 = makeController();

    subscribe('proj1', proj1.controller, 'u1');
    subscribe('proj2', proj2.controller, 'u2');

    broadcast('proj1', { type: 'comment:added', shotId: 's1', comment: {} });

    expect(proj1.controller.enqueue).toHaveBeenCalledTimes(1);
    expect(proj2.controller.enqueue).not.toHaveBeenCalled();
  });

  it('unsubscribe — больше не получает события', () => {
    const a = makeController();
    const unsubscribe = subscribe('proj1', a.controller, 'u1');

    broadcast('proj1', { type: 'shot:status', shotId: 's1', status: 'WIP' });
    expect(a.controller.enqueue).toHaveBeenCalledTimes(1);

    unsubscribe();

    broadcast('proj1', { type: 'shot:status', shotId: 's1', status: 'DONE' });
    expect(a.controller.enqueue).toHaveBeenCalledTimes(1); // не увеличилось
  });

  it('умерший controller (throws при enqueue) удаляется при следующем broadcast', () => {
    const dead = {
      enqueue: vi.fn(() => {
        throw new Error('controller closed');
      }),
    } as unknown as ReadableStreamDefaultController;
    const alive = makeController();

    subscribe('proj1', dead, 'u1');
    subscribe('proj1', alive.controller, 'u2');

    // Первый broadcast — dead падает, удаляется
    broadcast('proj1', { type: 'comment:added', shotId: 's1', comment: {} });
    expect(alive.controller.enqueue).toHaveBeenCalledTimes(1);

    // Второй — dead уже удалён, не вызывается
    broadcast('proj1', { type: 'comment:added', shotId: 's2', comment: {} });
    expect(alive.controller.enqueue).toHaveBeenCalledTimes(2);
    // dead вызывался только в первый раз
    expect(dead.enqueue).toHaveBeenCalledTimes(1);
  });
});
