import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-error';
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

export async function requireAuth(): Promise<GuardResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null, error: apiError('UNAUTHORIZED') };
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

export async function requireRole(allowed: Role[]): Promise<GuardResult> {
  const result = await requireAuth();
  if (result.error) return result;
  if (!allowed.includes(result.user.role)) {
    return { user: null, error: apiError('FORBIDDEN', `Требуется роль: ${allowed.join(', ')}`) };
  }
  return result;
}

export async function requireSelfOrAdmin(targetId: string): Promise<GuardResult> {
  const result = await requireAuth();
  if (result.error) return result;
  if (result.user.id !== targetId && result.user.role !== 'ADMIN') {
    return { user: null, error: apiError('FORBIDDEN') };
  }
  return result;
}
