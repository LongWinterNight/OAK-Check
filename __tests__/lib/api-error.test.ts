import { describe, it, expect } from 'vitest';
import { apiError } from '@/lib/api-error';

const STATUS_BY_CODE = {
  UNAUTHORIZED:     401,
  FORBIDDEN:        403,
  NOT_FOUND:        404,
  VALIDATION_ERROR: 400,
  CONFLICT:         409,
  GONE:             410,
  SERVER_ERROR:     500,
  LOCKED:           423,
  RATE_LIMIT:       429,
  UNPROCESSABLE:    422,
} as const;

describe('lib/api-error — apiError()', () => {
  for (const [code, expectedStatus] of Object.entries(STATUS_BY_CODE)) {
    it(`${code} → ${expectedStatus}`, () => {
      const res = apiError(code as keyof typeof STATUS_BY_CODE);
      expect(res.status).toBe(expectedStatus);
    });
  }

  it('возвращает JSON с полем "error" равным коду', async () => {
    const res = apiError('NOT_FOUND');
    const body = await res.json();
    expect(body.error).toBe('NOT_FOUND');
  });

  it('включает понятное сообщение в "message"', async () => {
    const res = apiError('FORBIDDEN');
    const body = await res.json();
    expect(typeof body.message).toBe('string');
    expect(body.message.length).toBeGreaterThan(0);
  });

  it('добавляет поле "detail" если передано', async () => {
    const res = apiError('VALIDATION_ERROR', 'title is required');
    const body = await res.json();
    expect(body.detail).toBe('title is required');
  });

  it('не добавляет поле "detail" если не передано', async () => {
    const res = apiError('SERVER_ERROR');
    const body = await res.json();
    expect(body.detail).toBeUndefined();
  });

  it('Content-Type — application/json', () => {
    const res = apiError('CONFLICT');
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
  });
});
