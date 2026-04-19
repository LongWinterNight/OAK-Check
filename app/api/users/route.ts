import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(users);
  } catch (e) {
    console.error('GET /api/users:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
