import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import TopBar from '@/components/layout/TopBar/TopBar';
import { Icons } from '@/components/icons';
import styles from './page.module.css';

type Role = 'ARTIST' | 'QA' | 'LEAD' | 'POST' | 'PM' | 'ADMIN';

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;
  const role = (session.user as { role?: Role }).role ?? 'ARTIST';

  // ARTIST/POST — see comments on their own shots
  if (role === 'ARTIST' || role === 'POST') {
    const shots = await prisma.shot.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { id: true, title: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        versions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return (
      <>
        <TopBar breadcrumbs={[{ label: 'Ревью' }]} />
        <div className={styles.content}>
          {shots.length === 0 ? (
            <div className={styles.empty}>
              <Icons.Eye size={36} />
              <div className={styles.emptyTitle}>Нет назначенных шотов</div>
              <div className={styles.emptyText}>Когда вам назначат шот, он появится здесь</div>
            </div>
          ) : (
            <div className={styles.list}>
              {shots.map((shot) => {
                const previewUrl = (shot.versions[0] as { url?: string } | undefined)?.url ?? null;
                return (
                  <Link
                    key={shot.id}
                    href={`/projects/${shot.project.id}/${shot.id}/checklist`}
                    className={styles.card}
                  >
                    <div className={styles.thumb}>
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt={shot.code} className={styles.thumbImg} />
                      ) : (
                        <div className={styles.thumbPlaceholder}>
                          <Icons.Image size={20} />
                        </div>
                      )}
                    </div>
                    <div className={styles.info}>
                      <div className={styles.infoTop}>
                        <span className={styles.code}>{shot.code}</span>
                        <span className={styles.badge}>{shot.status}</span>
                      </div>
                      <div className={styles.title}>{shot.title}</div>
                      <div className={styles.meta}>
                        <span className={styles.project}>{shot.project.title}</span>
                        {shot.comments.length > 0 && (
                          <span className={styles.assignee}>{shot.comments.length} комм.</span>
                        )}
                      </div>
                    </div>
                    <Icons.ChevR size={16} color="var(--fg-subtle)" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  // QA / LEAD / PM / ADMIN — review queue (all REVIEW status shots they have access to)
  const projectFilter = role === 'ADMIN' || role === 'PM'
    ? {}
    : role === 'LEAD'
    ? {
        project: {
          shots: { some: { assigneeId: userId } },
        },
      }
    : { shots: { some: { assigneeId: userId } } };

  const reviewShots = await prisma.shot.findMany({
    where: {
      status: 'REVIEW',
      ...(role !== 'ADMIN' && role !== 'PM'
        ? { project: projectFilter }
        : {}),
    },
    include: {
      project: { select: { id: true, title: true } },
      owner: { select: { name: true } },
      versions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
    take: 30,
  });

  return (
    <>
      <TopBar breadcrumbs={[{ label: 'Ревью' }]} />
      <div className={styles.content}>
        {reviewShots.length === 0 ? (
          <div className={styles.empty}>
            <Icons.Eye size={36} />
            <div className={styles.emptyTitle}>Нет шотов на ревью</div>
            <div className={styles.emptyText}>Когда артисты отправят шот на ревью — они появятся здесь</div>
          </div>
        ) : (
          <div className={styles.list}>
            {reviewShots.map((shot) => {
              const previewUrl = (shot.versions[0] as { url?: string } | undefined)?.url ?? null;
              return (
                <Link
                  key={shot.id}
                  href={`/projects/${shot.project.id}/${shot.id}/checklist`}
                  className={styles.card}
                >
                  <div className={styles.thumb}>
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt={shot.code} className={styles.thumbImg} />
                    ) : (
                      <div className={styles.thumbPlaceholder}>
                        <Icons.Image size={20} />
                      </div>
                    )}
                  </div>
                  <div className={styles.info}>
                    <div className={styles.infoTop}>
                      <span className={styles.code}>{shot.code}</span>
                      <span className={styles.badge}>Review</span>
                    </div>
                    <div className={styles.title}>{shot.title}</div>
                    <div className={styles.meta}>
                      <span className={styles.project}>{shot.project.title}</span>
                      {shot.owner && (
                        <span className={styles.assignee}>{shot.owner.name}</span>
                      )}
                    </div>
                  </div>
                  <Icons.ChevR size={16} color="var(--fg-subtle)" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
