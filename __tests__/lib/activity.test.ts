import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мок Prisma до импорта logActivity
const mockCreate = vi.fn();
vi.mock('@/lib/prisma', () => ({
  prisma: {
    activity: {
      create: (args: unknown) => mockCreate(args),
    },
  },
}));

import { logActivity } from '@/lib/activity';

describe('lib/activity — logActivity', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('передаёт data в prisma.activity.create', async () => {
    mockCreate.mockResolvedValue({ id: 'act1' });
    await logActivity({
      userId: 'u1',
      type: 'COMMENT_ADDED' as never,
      message: 'Иван прокомментировал шот',
      shotId: 'shot1',
    });
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        type: 'COMMENT_ADDED',
        message: 'Иван прокомментировал шот',
        shotId: 'shot1',
      },
    });
  });

  it('shotId опционален', async () => {
    mockCreate.mockResolvedValue({ id: 'act2' });
    await logActivity({
      userId: 'u1',
      type: 'USER_DELETED' as never,
      message: 'Удалён юзер',
    });
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.data.shotId).toBeUndefined();
  });

  it('НЕ падает при ошибке prisma — main-операция должна идти дальше', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCreate.mockRejectedValue(new Error('DB connection lost'));

    // Не throw'ит — это контракт logActivity (try/catch внутри)
    await expect(
      logActivity({ userId: 'u1', type: 'ITEM_CREATED' as never, message: 'X' }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith('[activity]', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('возвращает Promise<void>', async () => {
    mockCreate.mockResolvedValue({});
    const result = await logActivity({
      userId: 'u1',
      type: 'MEMBER_ADDED' as never,
      message: 'X',
    });
    expect(result).toBeUndefined();
  });
});
