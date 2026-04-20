import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const RegisterSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(64),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { token, name, password } = parsed.data;

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

    const existing = await prisma.user.findUnique({ where: { email: invitation.email } });
    if (existing) {
      return NextResponse.json({ error: 'Пользователь с этим email уже зарегистрирован' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        name: name.trim(),
        role: invitation.role,
        passwordHash,
      },
    });

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'MEMBER_ADDED',
        message: `${user.name} присоединился к команде`,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error('POST /api/auth/register:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
