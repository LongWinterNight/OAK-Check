import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мокаем @/auth до импорта auth-guard
const mockAuth = vi.fn();
vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}));

import { requireAuth, requireRole, requireSelfOrAdmin } from '@/lib/auth-guard';

describe('lib/auth-guard', () => {
  beforeEach(() => mockAuth.mockReset());

  describe('requireAuth', () => {
    it('возвращает user если сессия есть', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'u1', name: 'Иван', email: 'i@b.co', role: 'ARTIST' },
      });
      const result = await requireAuth();
      expect(result.error).toBeNull();
      expect(result.user).toEqual({
        id: 'u1', name: 'Иван', email: 'i@b.co', role: 'ARTIST',
      });
    });

    it('возвращает 401 если нет сессии', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await requireAuth();
      expect(result.user).toBeNull();
      expect(result.error?.status).toBe(401);
    });

    it('возвращает 401 если нет user.id', async () => {
      mockAuth.mockResolvedValue({ user: { name: 'no id' } });
      const result = await requireAuth();
      expect(result.user).toBeNull();
      expect(result.error?.status).toBe(401);
    });

    it('подставляет пустые строки если name/email отсутствуют', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } });
      const result = await requireAuth();
      expect(result.user?.name).toBe('');
      expect(result.user?.email).toBe('');
    });
  });

  describe('requireRole', () => {
    it('пропускает если роль в allowed', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'u1', name: 'X', email: 'x@x', role: 'LEAD' },
      });
      const result = await requireRole(['LEAD', 'ADMIN']);
      expect(result.error).toBeNull();
      expect(result.user?.role).toBe('LEAD');
    });

    it('отклоняет 403 если роль не в allowed', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'u1', name: 'X', email: 'x@x', role: 'ARTIST' },
      });
      const result = await requireRole(['LEAD', 'ADMIN']);
      expect(result.user).toBeNull();
      expect(result.error?.status).toBe(403);
    });

    it('возвращает 401 если нет сессии (а не 403)', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await requireRole(['LEAD']);
      expect(result.user).toBeNull();
      expect(result.error?.status).toBe(401);
    });
  });

  describe('requireSelfOrAdmin', () => {
    it('пропускает себя', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'u1', name: 'X', email: 'x@x', role: 'ARTIST' },
      });
      const result = await requireSelfOrAdmin('u1');
      expect(result.error).toBeNull();
      expect(result.user?.id).toBe('u1');
    });

    it('пропускает ADMIN на чужой target', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'admin-id', name: 'A', email: 'a@a', role: 'ADMIN' },
      });
      const result = await requireSelfOrAdmin('other-user-id');
      expect(result.error).toBeNull();
    });

    it('отклоняет 403 на чужом target если не ADMIN', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'u1', name: 'X', email: 'x@x', role: 'LEAD' },
      });
      const result = await requireSelfOrAdmin('other-user-id');
      expect(result.user).toBeNull();
      expect(result.error?.status).toBe(403);
    });

    it('возвращает 401 если нет сессии', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await requireSelfOrAdmin('u1');
      expect(result.user).toBeNull();
      expect(result.error?.status).toBe(401);
    });
  });
});
