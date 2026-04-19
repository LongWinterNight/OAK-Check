'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Badge, Button, ProgressBar } from '@/components/ui';
import { shotStatusBadgeKind } from '@/lib/utils';
import { toast } from '@/components/ui/Toast/toastStore';
import { NewProjectModal } from './NewProjectModal';
import styles from './ProjectsGrid.module.css';

type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'DONE' | 'ARCHIVED';

interface ShotSummary {
  id: string;
  code: string;
  status: string;
  progress: number;
}

interface Project {
  id: string;
  title: string;
  client: string;
  status: ProjectStatus;
  dueDate: string | null;
  shots: ShotSummary[];
  totalProgress: number;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: 'Активный',
  PAUSED: 'На паузе',
  DONE: 'Завершён',
  ARCHIVED: 'Архив',
};

const PROJECT_COLORS = [
  ['#4F6EBD', '#2A3E7A'],
  ['#8C5E1E', '#4A3616'],
  ['#3F8C4A', '#1F4A26'],
  ['#B87A14', '#6B4600'],
  ['#7B4FBD', '#3E2A6A'],
];

function projectGradient(id: string) {
  const idx = id.charCodeAt(0) % PROJECT_COLORS.length;
  const [a, b] = PROJECT_COLORS[idx];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

function ProjectCard({ project }: { project: Project }) {
  const doneShots = project.shots.filter((s) => s.status === 'DONE').length;

  return (
    <Link href={`/projects/${project.id}`} className={styles.card}>
      <div className={styles.cardHeader}>
        <div
          className={styles.thumb}
          style={{ background: projectGradient(project.id) }}
          aria-hidden="true"
        />
        <div className={styles.cardMeta}>
          <Badge kind={shotStatusBadgeKind(project.status as any)} size="sm" dot>
            {STATUS_LABELS[project.status]}
          </Badge>
          {project.dueDate && (
            <span className={styles.due}>
              <Icons.Calendar size={11} />
              {new Date(project.dueDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.client}>{project.client}</div>
        <div className={styles.title}>{project.title}</div>
        <ProgressBar value={project.totalProgress} height={5} />
        <div className={styles.cardFooter}>
          <span className={styles.shotCount}>
            {doneShots}/{project.shots.length} шотов
          </span>
          <span className={styles.progress}>{Math.round(project.totalProgress)}%</span>
        </div>
      </div>
    </Link>
  );
}

interface ProjectsGridProps {
  initialProjects: Project[];
}

export function ProjectsGrid({ initialProjects }: ProjectsGridProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = projects.filter(
    (p) =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreated = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
    toast.success(`Проект «${project.title}» создан`);
  };

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Icons.Search size={14} />
          <input
            className={styles.search}
            placeholder="Поиск по проектам…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Icons.Plus size={13} />}
          onClick={() => setShowModal(true)}
        >
          Новый проект
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Icons.Folder size={32} color="var(--fg-subtle)" />
          <span>{search ? 'Проекты не найдены' : 'Нет проектов'}</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
