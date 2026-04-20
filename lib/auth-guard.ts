import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { Role } from '@/lib/roles';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type GuardResult =
  | { user: SessionUser; error: null }
  | { user: null; error: NextResponse };

/** Проверяет наличие сессии. Возвращает user или error 401. */
export async function requireAuth(): Promise<GuardResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { user: null, error: NextResponse.json({ error: 'Не авторизован' }, { status: 401 }) };
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name ?? '',
      email: session.user.email ?? '',
      role: session.user.role,
    },
    error: null,
  };
}

/** Проверяет сессию и роль. Возвращает user или error 401/403. */
export async function requireRole(allowed: Role[]): Promise<GuardResult> {
  const result = await requireAuth();
  if (result.error) return result;

  if (!allowed.includes(result.user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: `Нет доступа. Требуется роль: ${allowed.join(', ')}` },
        { status: 403 }
      ),
    };
  }

  return result;
}

/** Проверяет что пользователь — это он сам или ADMIN. */
export async function requireSelfOrAdmin(targetId: string): Promise<GuardResult> {
  const result = await requireAuth();
  if (result.error) return result;

  if (result.user.id !== targetId && result.user.role !== 'ADMIN') {
    return {
      user: null,
      error: NextResponse.json({ error: 'Нет доступа' }, { status: 403 }),
    };
  }

  return result;
}
