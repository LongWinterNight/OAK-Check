import TopBar from '@/components/layout/TopBar/TopBar';
import { LibraryClient } from '@/components/library/LibraryClient';
import styles from './page.module.css';

async function getTemplates() {
  try {
    const { prisma } = await import('@/lib/prisma');
    return prisma.checklistTemplate.findMany({
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: { usedCount: 'desc' },
    });
  } catch {
    return [];
  }
}

async function getShots() {
  try {
    const { prisma } = await import('@/lib/prisma');
    return prisma.shot.findMany({
      select: { id: true, code: true, title: true },
      orderBy: { code: 'asc' },
    });
  } catch {
    return [];
  }
}

export default async function LibraryPage() {
  const [rawTemplates, rawShots] = await Promise.all([getTemplates(), getShots()]);

  const templates = rawTemplates.map((t) => ({
    ...t,
    items: t.items.map((i) => ({ id: i.id, title: i.title, order: i.order })),
  }));

  const shots = rawShots.map((s) => ({ id: s.id, code: s.code, title: s.title }));

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Библиотека шаблонов' }]} />
      <div className={styles.content}>
        <LibraryClient templates={templates} shots={shots} />
      </div>
    </>
  );
}
