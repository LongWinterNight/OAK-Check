import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

/**
 * rateLimit использует in-memory Map со scope на модуль. Между тестами
 * это «состояние» переносится — поэтому каждый тест использует УНИКАЛЬНЫЙ
 * ключ (chunk-N) чтобы изоляция была. Альтернатива — vi.resetModules,
 * но это медленнее.
 */
describe('lib/rate-limit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('первый запрос всегда разрешён', () => {
    expect(rateLimit('rl-1', 5, 60_000)).toBe(true);
  });

  it('запросы в пределах лимита проходят', () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit('rl-2', 5, 60_000)).toBe(true);
    }
  });

  it('запрос за пределом лимита отклоняется', () => {
    for (let i = 0; i < 5; i++) rateLimit('rl-3', 5, 60_000);
    expect(rateLimit('rl-3', 5, 60_000)).toBe(false);
    expect(rateLimit('rl-3', 5, 60_000)).toBe(false);
  });

  it('после истечения окна — счётчик сбрасывается', () => {
    for (let i = 0; i < 5; i++) rateLimit('rl-4', 5, 60_000);
    expect(rateLimit('rl-4', 5, 60_000)).toBe(false);
    // продвигаем время на минуту + 1ms
    vi.advanceTimersByTime(60_001);
    expect(rateLimit('rl-4', 5, 60_000)).toBe(true);
  });

  it('разные ключи изолированы', () => {
    for (let i = 0; i < 5; i++) rateLimit('rl-5a', 5, 60_000);
    expect(rateLimit('rl-5a', 5, 60_000)).toBe(false);
    // другой ключ свежий
    expect(rateLimit('rl-5b', 5, 60_000)).toBe(true);
  });

  it('limit=1 — каждый второй запрос отклоняется в окне', () => {
    expect(rateLimit('rl-6', 1, 1000)).toBe(true);
    expect(rateLimit('rl-6', 1, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit('rl-6', 1, 1000)).toBe(true);
  });

  it('часовое окно — реалистичный сценарий загрузок (20/час)', () => {
    for (let i = 0; i < 20; i++) {
      expect(rateLimit('rl-7', 20, 60 * 60_000)).toBe(true);
    }
    expect(rateLimit('rl-7', 20, 60 * 60_000)).toBe(false);
    // Через 30 минут — всё ещё блок
    vi.advanceTimersByTime(30 * 60_000);
    expect(rateLimit('rl-7', 20, 60 * 60_000)).toBe(false);
    // Через 60 минут+ — снова можно
    vi.advanceTimersByTime(31 * 60_000);
    expect(rateLimit('rl-7', 20, 60 * 60_000)).toBe(true);
  });
});
