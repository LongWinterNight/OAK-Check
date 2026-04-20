import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guard';
import { sendInviteEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity';
import { CreateInvitationSchema } from '@/lib/zod-schemas';
import { randomBytes } from 'crypto';

export async function GET() {
  const { error } = await requireRole(['ADMIN']);
  if (error) return error;

  try {
    // Удаляем истёкшие неиспользованные инвайты перед возвратом
    await prisma.invitation.deleteMany({
      where: { expiresAt: { lt: new Date() }, usedAt: null },
    });

    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { id: true, name: true } } },
    });
    return NextResponse.json(invitations);
  } catch (e) {
    console.error('GET /api/invitations:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = CreateInvitationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, role } = parsed.data;

    // Проверяем что юзер с таким email ещё не существует
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Пользователь с этим email уже зарегистрирован' }, { status: 409 });
    }

    // Удаляем старое неиспользованное приглашение для этого email (если есть)
    await prisma.invitation.deleteMany({
      where: { email, usedAt: null },
    });

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // +48 часов
    const token = randomBytes(32).toString('hex');

    const invitation = await prisma.invitation.create({
      data: { email, role, createdBy: user.id, expiresAt, token },
    });

    // Отправляем email (или логируем ссылку в dev-режиме)
    await sendInviteEmail({
      to: email,
      token: invitation.token,
      inviterName: user.name,
      role,
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/invite/${invitation.token}`;

    await logActivity({
      userId: user.id,
      type: 'INVITE_CREATED',
      message: `${user.name} отправил приглашение для ${email} (роль: ${role})`,
    });

    return NextResponse.json({ ...invitation, inviteUrl }, { status: 201 });
  } catch (e) {
    console.error('POST /api/invitations:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
