import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { requireAuth } from '@/lib/auth-guard';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  '.exr': 'image/x-exr',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { filename } = await params;

  // Защита от path traversal
  const safe = basename(filename);
  if (safe !== filename || filename.includes('..')) {
    return new NextResponse('Not found', { status: 404 });
  }

  const uploadsDir = process.env.UPLOAD_DIR ?? join(process.cwd(), 'public', 'uploads');
  const filePath = join(uploadsDir, safe);

  try {
    const data = await readFile(filePath);
    const ext = extname(safe).toLowerCase();
    const contentType = MIME[ext] ?? 'application/octet-stream';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
