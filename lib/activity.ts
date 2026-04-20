import { prisma } from './prisma';
import type { ActivityType } from '@prisma/client';

export async function logActivity(params: {
  userId: string;
  type: ActivityType;
  message: string;
  shotId?: string;
}): Promise<void> {
  try {
    await prisma.activity.create({ data: params });
  } catch (e) {
    console.error('[activity]', e);
  }
}
