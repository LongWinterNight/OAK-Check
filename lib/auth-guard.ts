import { auth } from '@/auth';
import { NextResponse } from 'next/server';

type Role = 'ARTIST' | 'LEAD' | 'QA' | 'POST' | 'PM' | 'ADMIN';

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
  const raw = session?.user as { id?: string; name?: string; email?: string; role?: string } | undefined;

  if (!raw?.id) {
    return { user: null, error: NextResponse.json({ error: 'Не авторизован' }, { status: 401 }) };
  }

  return {
    user: {
      id: raw.id,
      name: raw.name ?? '',
      email: raw.email ?? '',
      role: (raw.role ?? 'ARTIST') as Role,
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
