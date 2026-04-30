import { describe, it, expect, vi, afterEach } from 'vitest';
import { uid } from '@/lib/uid';

describe('lib/uid', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('возвращает непустую строку', () => {
    const id = uid();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(5);
  });

  it('генерирует уникальные значения', () => {
    const ids = new Set(Array.from({ length: 100 }, () => uid()));
    expect(ids.size).toBe(100);
  });

  it('использует crypto.randomUUID если доступен', () => {
    const mockUuid = vi.fn(() => '11111111-1111-1111-1111-111111111111' as `${string}-${string}-${string}-${string}-${string}`);
    vi.stubGlobal('crypto', { randomUUID: mockUuid });

    const id = uid();
    expect(mockUuid).toHaveBeenCalled();
    expect(id).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('fallback работает в окружении без crypto.randomUUID', () => {
    // crypto без randomUUID (как в http не-secure context)
    vi.stubGlobal('crypto', {});
    const id = uid();
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });

  it('fallback работает когда crypto undefined', () => {
    vi.stubGlobal('crypto', undefined);
    const id = uid();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(5);
  });
});
