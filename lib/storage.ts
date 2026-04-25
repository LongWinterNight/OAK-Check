import 'server-only';
import { access, statfs } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

export interface StorageStatus {
  path: string;
  accessible: boolean;
  error?: string;
  usedBytes: number;          // суммарный размер файлов, известных приложению (RenderVersion.fileSize)
  fileCount: number;          // количество файлов RenderVersion
  diskTotalBytes?: number;    // общий объём смонтированного диска
  diskFreeBytes?: number;     // свободное место на смонтированном диске
}

const UPLOAD_DIR_DEFAULT = join(process.cwd(), 'public', 'uploads');

export async function getStorageStatus(): Promise<StorageStatus> {
  const path = process.env.UPLOAD_DIR ?? UPLOAD_DIR_DEFAULT;

  const [usedAgg, fileCount] = await Promise.all([
    prisma.renderVersion.aggregate({ _sum: { fileSize: true } }),
    prisma.renderVersion.count(),
  ]);
  const usedBytes = usedAgg._sum.fileSize ?? 0;

  try {
    await access(path, constants.R_OK | constants.W_OK);
  } catch (e) {
    return {
      path,
      accessible: false,
      error: (e as { code?: string }).code === 'ENOENT'
        ? 'Папка не найдена'
        : 'Нет доступа на запись',
      usedBytes,
      fileCount,
    };
  }

  let diskTotalBytes: number | undefined;
  let diskFreeBytes: number | undefined;
  try {
    const stats = await statfs(path);
    const blockSize = Number(stats.bsize);
    diskTotalBytes = blockSize * Number(stats.blocks);
    diskFreeBytes = blockSize * Number(stats.bavail);
  } catch {
    // statfs может падать на некоторых ФС/Windows версиях — оставляем undefined
  }

  return {
    path,
    accessible: true,
    usedBytes,
    fileCount,
    diskTotalBytes,
    diskFreeBytes,
  };
}

