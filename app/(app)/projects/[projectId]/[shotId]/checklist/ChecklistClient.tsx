'use client';

import { useState, useCallback } from 'react';
import ShotHeader from '@/components/checklist/ShotHeader/ShotHeader';
import ChaptersPanel from '@/components/checklist/ChaptersPanel/ChaptersPanel';
import ItemsList from '@/components/checklist/ItemsList/ItemsList';
import RightPanel from '@/components/checklist/RightPanel/RightPanel';
import { UploadRenderModal } from '@/components/checklist/UploadRenderModal/UploadRenderModal';
import TopBar from '@/components/layout/TopBar/TopBar';
import { Button } from '@/components/ui';
import { Icons } from '@/components/icons';
import { computeChapterStats, computeProgress } from '@/lib/utils';
import { toast } from '@/components/ui/Toast/toastStore';
import { useSSE } from '@/hooks/useSSE';
import { can, type Role } from '@/lib/roles';
import type { SSEEvent } from '@/lib/sse/emitter';
import type { Shot, ChapterWithItems, RenderVersion, Comment } from '@/types';
import styles from './page.module.css';

interface ChecklistClientProps {
  shot: Shot;
  projectId: string;
  initialChapters: ChapterWithItems[];
  versions: RenderVersion[];
  comments: Comment[];
  currentUser: { id: string; name: string };
  userRole: Role;
}

export default function ChecklistClient({
  shot,
  projectId,
  initialChapters,
  versions: initialVersions,
  comments: initialComments,
  currentUser,
  userRole,
}: ChecklistClientProps) {
  const [chapters, setChapters] = useState(initialChapters);
  const [activeChapterId, setActiveChapterId] = useState(initialChapters[0]?.id ?? '');
  const [comments, setComments] = useState(initialComments);
  const [versions, setVersions] = useState(initialVersions);
  const [showUpload, setShowUpload] = useState(false);
  const [shotStatus, setShotStatus] = useState(shot.status);

  const applyStateChange = useCallback((itemId: string, state: string) => {
    setChapters((prev) =>
      prev.map((chapter) => {
        const updatedItems = chapter.items.map((item) =>
          item.id === itemId ? { ...item, state: state as 'TODO' | 'WIP' | 'DONE' | 'BLOCKED' } : item
        );
        const stats = computeChapterStats(updatedItems);
        return { ...chapter, items: updatedItems, ...stats };
      })
    );
  }, []);

  useSSE(projectId, useCallback((event: SSEEvent) => {
    if (event.type === 'checklist:updated' && event.shotId === shot.id) {
      applyStateChange(event.itemId, event.state);
    }
    if (event.type === 'comment:added' && event.shotId === shot.id) {
      setComments((prev) => {
        const c = event.comment as Comment;
        if (prev.find((x) => x.id === c.id)) return prev;
        return [...prev, c];
      });
    }
  }, [shot.id, applyStateChange]));

  const totalItems = chapters.flatMap((c) => c.items);
  const totalProgress = computeProgress(totalItems);
  const activeChapter = chapters.find((c) => c.id === activeChapterId) ?? chapters[0];

  const handleStateChange = async (itemId: string, state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED') => {
    applyStateChange(itemId, state);
    try {
      await fetch(`/api/shots/${shot.id}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });
    } catch {
      toast.error('Не удалось сохранить изменение');
    }
  };

  const NEXT_STATUS: Record<string, 'TODO' | 'WIP' | 'REVIEW' | 'DONE'> = {
    TODO: 'WIP', WIP: 'REVIEW', REVIEW: 'DONE', DONE: 'WIP',
  };

  const handleSendReview = async () => {
    const next = NEXT_STATUS[shotStatus];
    try {
      const res = await fetch(`/api/shots/${shot.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) setShotStatus(next);
      else toast.error('Не удалось сменить статус');
    } catch {
      toast.error('Ошибка сети');
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
      toast.error('Не удалось отправить комментарий');
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
          <Button
            variant="secondary"
            size="sm"
            icon={<Icons.Upload size={14} />}
            onClick={() => setShowUpload(true)}
          >
            Загрузить рендер
          </Button>
        }
      />
      <div className={styles.page}>
        <ShotHeader
          shot={{ ...shot, status: shotStatus }}
          progress={totalProgress}
          latestVersion={versions[versions.length - 1]?.version ?? 'v001'}
          canChangeStatus={can.changeStatus(userRole)}
          onUploadRender={() => setShowUpload(true)}
          onSendReview={handleSendReview}
        />
        <div className={styles.body}>
          <ChaptersPanel
            chapters={chapters}
            activeId={activeChapterId}
            shotId={shot.id}
            onSelect={setActiveChapterId}
            onChapterCreated={(chapter) => {
              setChapters((prev) => [...prev, chapter]);
              setActiveChapterId(chapter.id);
            }}
            canManage={can.manageChecklist(userRole)}
          />
          {activeChapter && (
            <ItemsList
              chapter={activeChapter}
              shotId={shot.id}
              currentUserId={currentUser.id}
              onStateChange={handleStateChange}
              onItemCreated={(item) => {
                setChapters((prev) => prev.map((ch) =>
                  ch.id === item.chapterId
                    ? { ...ch, items: [...ch.items, item], ...computeChapterStats([...ch.items, item]) }
                    : ch
                ));
              }}
              canManage={can.manageChecklist(userRole)}
            />
          )}
          <RightPanel
            versions={versions}
            comments={comments}
            currentUser={currentUser}
            onCommentSubmit={handleCommentSubmit}
          />
        </div>
      </div>

      {showUpload && (
        <UploadRenderModal
          shotId={shot.id}
          onUploaded={(v) => setVersions((prev) => [...prev, v])}
          onClose={() => setShowUpload(false)}
        />
      )}
    </>
  );
}
