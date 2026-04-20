import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true, name: true, email: true, role: true,
        online: true, avatarUrl: true, createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (e) {
    console.error('GET /api/users:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
