import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateProjectSchema } from '@/lib/zod-schemas';
import { requireAuth, requireRole } from '@/lib/auth-guard';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const projects = await prisma.project.findMany({
      include: { _count: { select: { shots: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(projects);
  } catch (e) {
    console.error('GET /api/projects:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole(['LEAD', 'PM', 'ADMIN']);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Невалидные данные' }, { status: 400 });
    }
    const project = await prisma.project.create({ data: parsed.data });
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    console.error('POST /api/projects:', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
