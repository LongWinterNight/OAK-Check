import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-guard';

export async function POST() {
  const { error } = await requireRole(['ADMIN']);
  if (error) return error;

  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
