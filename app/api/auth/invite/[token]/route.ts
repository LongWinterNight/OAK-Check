import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const invitation = await prisma.invitation.findUnique({ where: { token } });

    if (!invitation) {
      return NextResponse.json({ error: 'Приглашение не найдено' }, { status: 404 });
    }
    if (invitation.usedAt) {
      return NextResponse.json({ error: 'Это приглашение уже использовано' }, { status: 410 });
    }
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Срок действия приглашения истёк' }, { status: 410 });
    }

    return NextResponse.json({ email: invitation.email, role: invitation.role });
  } catch (e) {
    logger.error('GET /api/auth/invite/[token]:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
