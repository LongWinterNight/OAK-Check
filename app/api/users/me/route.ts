import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { UpdateMeSchema } from '@/lib/zod-schemas';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });

    const { passwordHash: _ph, ...safe } = user;
    return NextResponse.json({ ...safe, createdAt: safe.createdAt.toISOString() });
  } catch (e) {
    logger.error('[GET /api/users/me]', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const body = await req.json();
    const parsed = UpdateMeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });

    const { name, newPassword, currentPassword, avatarUrl } = parsed.data;
    const updateData: Record<string, string | null> = {};

    if (name) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Введите текущий пароль' }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
      if (user.passwordHash) {
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 });
    }

    // Dev-аккаунт существует только в сессии, не в БД
    if (session.user.id === 'dev-safan') {
      return NextResponse.json({ error: 'Данные demo-аккаунта нельзя изменить' }, { status: 403 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    const { passwordHash: _ph, ...safe } = updated;
    return NextResponse.json({ ...safe, createdAt: safe.createdAt.toISOString() });
  } catch (e) {
    logger.error('[PATCH /api/users/me]', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
