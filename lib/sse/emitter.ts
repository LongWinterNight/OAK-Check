type Subscriber = {
  controller: ReadableStreamDefaultController;
  projectId: string;
};

const subscribers = new Set<Subscriber>();

export type SSEEvent =
  | { type: 'checklist:updated'; shotId: string; itemId: string; state: string; userId: string }
  | { type: 'comment:added'; shotId: string; comment: unknown }
  | { type: 'render:uploaded'; shotId: string; version: unknown }
  | { type: 'shot:status'; shotId: string; status: string };

export function subscribe(projectId: string, controller: ReadableStreamDefaultController) {
  const sub: Subscriber = { controller, projectId };
  subscribers.add(sub);
  return () => subscribers.delete(sub);
}

export function broadcast(projectId: string, event: SSEEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  const encoded = new TextEncoder().encode(data);

  for (const sub of subscribers) {
    if (sub.projectId === projectId) {
      try {
        sub.controller.enqueue(encoded);
      } catch {
        subscribers.delete(sub);
      }
    }
  }
}

// Purge dead connections every 60 seconds.
setInterval(() => {
  const ping = new TextEncoder().encode(': ping\n\n');
  for (const sub of subscribers) {
    try {
      sub.controller.enqueue(ping);
    } catch {
      subscribers.delete(sub);
    }
  }
}, 60_000);
