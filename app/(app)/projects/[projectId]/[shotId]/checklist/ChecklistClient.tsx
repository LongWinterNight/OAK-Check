'use client';

import { useState } from 'react';
import ShotHeader from '@/components/checklist/ShotHeader/ShotHeader';
import ChaptersPanel from '@/components/checklist/ChaptersPanel/ChaptersPanel';
import ItemsList from '@/components/checklist/ItemsList/ItemsList';
import RightPanel from '@/components/checklist/RightPanel/RightPanel';
import TopBar from '@/components/layout/TopBar/TopBar';
import { Button } from '@/components/ui';
import { Icons } from '@/components/icons';
import { computeChapterStats, computeProgress } from '@/lib/utils';
import type { Shot, ChapterWithItems, RenderVersion, Comment } from '@/types';
import styles from './page.module.css';

interface ChecklistClientProps {
  shot: Shot;
  initialChapters: ChapterWithItems[];
  versions: RenderVersion[];
  comments: Comment[];
}

export default function ChecklistClient({
  shot,
  initialChapters,
  versions,
  comments: initialComments,
}: ChecklistClientProps) {
  const [chapters, setChapters] = useState(initialChapters);
  const [activeChapterId, setActiveChapterId] = useState(
    initialChapters[0]?.id ?? ''
  );
  const [comments, setComments] = useState(initialComments);

  const totalItems = chapters.flatMap((c) => c.items);
  const totalProgress = computeProgress(totalItems);

  const activeChapter = chapters.find((c) => c.id === activeChapterId) ?? chapters[0];

  // Оптимистичное обновление состояния пункта
  const handleStateChange = async (itemId: string, state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED') => {
    // Немедленно обновляем UI
    setChapters((prev) =>
      prev.map((chapter) => {
        const updatedItems = chapter.items.map((item) =>
          item.id === itemId ? { ...item, state } : item
        );
        const stats = computeChapterStats(updatedItems);
        return { ...chapter, items: updatedItems, ...stats };
      })
    );

    // Синхронизируем с сервером в фоне
    try {
      await fetch(`/api/shots/${shot.id}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });
    } catch {
      // При ошибке можно откатить — пока просто логируем
      console.error('Не удалось сохранить состояние пункта');
    }
  };

  const handleCommentSubmit = async (body: string) => {
    try {
      const res = await fetch(`/api/shots/${shot.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
      }
    } catch {
      console.error('Не удалось отправить комментарий');
    }
  };

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: shot.project?.title ?? 'Проект', href: `/projects/${shot.projectId}` },
          { label: shot.title },
          { label: 'Чек-лист' },
        ]}
        action={
          <Button variant="secondary" size="sm" icon={<Icons.Upload size={14} />}>
            Загрузить рендер
          </Button>
        }
      />
      <div className={styles.page}>
        {/* Хедер шота */}
        <ShotHeader
          shot={shot}
          progress={totalProgress}
          latestVersion={versions[versions.length - 1]?.version ?? 'v001'}
        />

        {/* Основная область */}
        <div className={styles.body}>
          {/* Панель глав */}
          <ChaptersPanel
            chapters={chapters}
            activeId={activeChapterId}
            onSelect={setActiveChapterId}
          />

          {/* Список пунктов */}
          {activeChapter && (
            <ItemsList
              chapter={activeChapter}
              currentUserId="u1"
              onStateChange={handleStateChange}
            />
          )}

          {/* Правая панель */}
          <RightPanel
            versions={versions}
            comments={comments}
            currentUser={{ name: 'Артём Ковалёв' }}
            onCommentSubmit={handleCommentSubmit}
          />
        </div>
      </div>
    </>
  );
}
