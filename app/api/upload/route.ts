import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { requireAuth } from '@/lib/auth-guard';
import { logger } from '@/lib/logger';

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/tiff',
  'image/x-exr', 'application/octet-stream',
]);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.exr']);
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Файл слишком большой (макс. 100 МБ)' }, { status: 413 });
    }

    const ext = extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: 'Недопустимый тип файла' }, { status: 415 });
    }

    if (file.type && !ALLOWED_TYPES.has(file.type) && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Недопустимый MIME-тип' }, { status: 415 });
    }

    const filename = `${randomUUID()}${ext}`;
    const uploadsDir = process.env.UPLOAD_DIR ?? join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ url: `/api/files/${filename}`, name: file.name, size: file.size });
  } catch (e) {
    logger.error('POST /api/upload:', e);
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
  }
}
