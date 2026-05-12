import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { apiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';

/**
 * Heartbeat — клиент пингует каждые 60 секунд пока вкладка открыта.
 * Сервер обновляет lastSeenAt + online: true.
 * Если lastSeenAt > now - 120s, пользователь считается онлайн.
 * Если вкладка закрылась — пинги прекратились, после 2 минут офлайн
 * (определяется при следующем GET /api/users или /api/users/me).
 *
 * Dev-юзера ('dev-safan') пропускаем — он in-memory, нет в БД.
 */
export async function POST() {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (user.id === 'dev-safan') {
    return NextResponse.json({ ok: true });
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { online: true, lastSeenAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error('POST /api/users/me/heartbeat:', e);
    return apiError('SERVER_ERROR');
  }
}
