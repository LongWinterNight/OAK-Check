const store = new Map<string, { count: number; reset: number }>();

// Returns true if request is allowed, false if limit exceeded.
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// Periodically purge expired entries to prevent unbounded memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.reset < now) store.delete(key);
  }
}, 5 * 60_000);
