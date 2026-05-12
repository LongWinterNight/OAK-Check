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
import type { Shot, ChapterWithItems, RenderVersion, Comment, User } from '@/types';
import styles from './page.module.css';

interface ChecklistClientProps {
  shot: Shot;
  projectId: string;
  initialChapters: ChapterWithItems[];
  versions: RenderVersion[];
  comments: Comment[];
  currentUser: { id: string; name: string };
  userRole: Role;
  users: Pick<User, 'id' | 'name'>[];
}

export default function ChecklistClient({
  shot,
  projectId,
  initialChapters,
  versions: initialVersions,
  comments: initialComments,
  currentUser,
  userRole,
  users,
}: ChecklistClientProps) {
  const [chapters, setChapters] = useState(initialChapters);
  const [activeChapterId, setActiveChapterId] = useState(initialChapters[0]?.id ?? '');
  const [comments, setComments] = useState(initialComments);
  const [versions, setVersions] = useState(initialVersions);
  const [showUpload, setShowUpload] = useState(false);
  const [shotStatus, setShotStatus] = useState(shot.status);
  const [assignee, setAssignee] = useState(shot.assignee ?? null);
  // Активная версия для scope'а новых пинов/комментариев — RightPanel
  // прокидывает наверх, чтобы при создании коммента мы знали к чему привязывать.
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  // Pin flow: temporary pin → user types comment → submit attaches pin
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  // Bidirectional sync between render pins and comment list
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  // Mobile panel tab: QA defaults to 'media', others to 'checklist'
  const [mobilePanel, setMobilePanel] = useState<'chapters' | 'checklist' | 'media'>(
    userRole === 'QA' ? 'media' : 'checklist'
  );

  // Идемпотентное добавление коммента в state — защита от race
  // POST-ответ vs SSE-broadcast (оба происходят почти одновременно для автора).
  const upsertComment = useCallback((c: Comment) => {
    setComments((prev) => {
      const idx = prev.findIndex((x) => x.id === c.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = c;
        return next;
      }
      return [...prev, c];
    });
  }, []);

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
      upsertComment(event.comment as Comment);
    }
    if (event.type === 'comment:updated' && event.shotId === shot.id) {
      upsertComment(event.comment as Comment);
    }
  }, [shot.id, applyStateChange, upsertComment]));

  const totalItems = chapters.flatMap((c) => c.items);
  const totalProgress = computeProgress(totalItems);
  const itemsDone = totalItems.filter((i) => i.state === 'DONE').length;
  const itemsTotal = totalItems.length;
  const activeChapter = chapters.find((c) => c.id === activeChapterId) ?? chapters[0];

  const canManage = can.manageChecklist(userRole);

  const handleStateChange = async (itemId: string, state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED') => {
    const prevChapters = chapters;
    applyStateChange(itemId, state);
    try {
      const res = await fetch(`/api/shots/${shot.id}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });
      if (!res.ok) {
        setChapters(prevChapters);
        const d = await res.json().catch(() => ({}));
        toast.error(d.message ?? 'Не удалось сохранить изменение');
      }
    } catch {
      setChapters(prevChapters);
      toast.error('Ошибка сети');
    }
  };

  const handleItemDeleted = (itemId: string, chapterId: string) => {
    setChapters((prev) => prev.map((ch) => {
      if (ch.id !== chapterId) return ch;
      const items = ch.items.filter((i) => i.id !== itemId);
      return { ...ch, items, ...computeChapterStats(items) };
    }));
  };

  const handleItemRenamed = (itemId: string, title: string) => {
    setChapters((prev) => prev.map((ch) => ({
      ...ch,
      items: ch.items.map((i) => i.id === itemId ? { ...i, title } : i),
    })));
  };

  const handleNoteChanged = (itemId: string, note: string | null) => {
    setChapters((prev) => prev.map((ch) => ({
      ...ch,
      items: ch.items.map((i) => i.id === itemId ? { ...i, note } : i),
    })));
  };

  // Локальное обновление note без re-fetch — для синхронизации после флага
  const handleNoteChangedLocal = handleNoteChanged;

  const handleItemAssigned = (
    itemId: string,
    ownerId: string | null,
    user: Pick<User, 'id' | 'name'> | null
  ) => {
    setChapters((prev) => prev.map((ch) => ({
      ...ch,
      items: ch.items.map((i) =>
        i.id === itemId
          ? { ...i, ownerId, owner: user ? { ...user, email: '', role: 'ARTIST' as const, avatarUrl: null, online: false, createdAt: '' } : null }
          : i
      ),
    })));
  };

  const handleChapterDeleted = (id: string) => {
    setChapters((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeChapterId === id && next.length > 0) {
        setActiveChapterId(next[0].id);
      }
      return next;
    });
  };

  const handleChapterRenamed = (id: string, title: string) => {
    setChapters((prev) => prev.map((c) => c.id === id ? { ...c, title } : c));
  };

  const handleAssign = async (assigneeId: string | null) => {
    try {
      const res = await fetch(`/api/shots/${shot.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId }),
      });
      if (res.ok) {
        const found = assigneeId ? users.find((u) => u.id === assigneeId) ?? null : null;
        setAssignee(found ? { ...found, email: '', role: 'ARTIST', avatarUrl: null, online: false, createdAt: '' } : null);
      } else {
        toast.error('Не удалось изменить исполнителя');
      }
    } catch {
      toast.error('Ошибка сети');
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

  const postComment = async (body: string, pin?: { x: number; y: number }, parentId?: string) => {
    const trimmed = body.trim();
    if (!trimmed) return null;
    try {
      const res = await fetch(`/api/shots/${shot.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: trimmed,
          ...(pin ? { pinX: pin.x, pinY: pin.y } : {}),
          ...(parentId ? { parentId } : {}),
          // Прикрепляем к текущей активной версии — чтобы коммент/пин
          // показывался только на ней (и в ленте этой версии)
          ...(activeVersionId ? { versionId: activeVersionId } : {}),
        }),
      });
      if (res.ok) {
        const newComment = await res.json();
        upsertComment(newComment);
        return newComment;
      }
      const d = await res.json().catch(() => ({}));
      toast.error(d.message ?? 'Не удалось отправить комментарий');
      return null;
    } catch {
      toast.error('Не удалось отправить комментарий');
      return null;
    }
  };

  const handleCommentSubmit = async (body: string) => {
    const pin = pendingPin;
    const result = await postComment(body, pin ?? undefined);
    if (result) setPendingPin(null);
  };

  const handleLightboxPinSubmit = async (body: string, x: number, y: number) => {
    return postComment(body, { x, y });
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/shots/${shot.id}/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        toast.error('Не удалось удалить комментарий');
      }
    } catch {
      toast.error('Ошибка сети');
    }
  };

  const handleCommentReply = async (parentId: string, body: string) => {
    await postComment(body, undefined, parentId);
  };

  const handleCommentEdit = async (commentId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(`/api/shots/${shot.id}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: trimmed }),
      });
      if (res.ok) {
        const updated = await res.json();
        upsertComment(updated);
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.message ?? 'Не удалось сохранить');
      }
    } catch {
      toast.error('Ошибка сети');
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
          itemsDone={itemsDone}
          itemsTotal={itemsTotal}
          latestVersion={versions[versions.length - 1]?.version ?? 'v001'}
          canChangeStatus={can.changeStatus(userRole)}
          canAssign={can.assign(userRole)}
          assignee={assignee}
          users={users}
          onUploadRender={() => setShowUpload(true)}
          onSendReview={handleSendReview}
          onAssign={handleAssign}
        />

        {/* Mobile: tab bar for switching between panels */}
        <div className={styles.mobilePanelTabs} role="tablist">
          {[
            { id: 'chapters',  label: 'Главы' },
            { id: 'checklist', label: 'Чеклист' },
            { id: 'media',     label: 'Медиа' },
          ].map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={mobilePanel === id}
              className={[
                styles.mobilePanelTab,
                mobilePanel === id ? styles.panelActive : '',
              ].join(' ')}
              onClick={() => setMobilePanel(id as typeof mobilePanel)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          <ChaptersPanel
            chapters={chapters}
            activeId={activeChapterId}
            shotId={shot.id}
            onSelect={(id) => { setActiveChapterId(id); setMobilePanel('checklist'); }}
            onChapterCreated={(chapter) => {
              setChapters((prev) => [...prev, chapter]);
              setActiveChapterId(chapter.id);
              setMobilePanel('checklist');
            }}
            onChapterDeleted={handleChapterDeleted}
            onChapterRenamed={handleChapterRenamed}
            canManage={canManage}
            className={[
              // Mobile: hide unless chapters tab active
              mobilePanel !== 'chapters' ? styles.panelHidden : '',
              // Tablet: always hidden (ChaptersPanel is a sidebar)
              styles.chaptersHideTablet,
            ].join(' ')}
          />
          {activeChapter && (
            <ItemsList
              chapter={activeChapter}
              shotId={shot.id}
              currentUserId={currentUser.id}
              users={users}
              onStateChange={handleStateChange}
              onItemCreated={(item) => {
                setChapters((prev) => prev.map((ch) =>
                  ch.id === item.chapterId
                    ? { ...ch, items: [...ch.items, item], ...computeChapterStats([...ch.items, item]) }
                    : ch
                ));
              }}
              onItemDeleted={handleItemDeleted}
              onItemRenamed={handleItemRenamed}
              onNoteChanged={handleNoteChanged}
              onItemAssigned={handleItemAssigned}
              onItemFlagged={(itemId, blocked, note) => {
                applyStateChange(itemId, blocked ? 'BLOCKED' : 'TODO');
                if (note !== null) handleNoteChangedLocal(itemId, note);
              }}
              canManage={canManage}
              className={mobilePanel !== 'checklist' ? styles.panelHidden : ''}
            />
          )}
          <RightPanel
            versions={versions}
            comments={comments}
            currentUser={currentUser}
            currentUserRole={userRole}
            shotCode={shot.code}
            shotTitle={shot.title}
            onActiveVersionChange={setActiveVersionId}
            canDeleteVersion={can.deleteShot(userRole)}
            canPin={can.pinComment(userRole)}
            pendingPin={pendingPin}
            onPinSet={(x, y) => setPendingPin({ x, y })}
            onPinClear={() => setPendingPin(null)}
            highlightedCommentId={highlightedCommentId}
            onHighlight={setHighlightedCommentId}
            onCommentSubmit={handleCommentSubmit}
            onCommentDelete={handleCommentDelete}
            onCommentReply={handleCommentReply}
            onCommentEdit={handleCommentEdit}
            onLightboxPinSubmit={handleLightboxPinSubmit}
            onVersionDeleted={(versionId) => setVersions((prev) => prev.filter((v) => v.id !== versionId))}
            shotId={shot.id}
            className={mobilePanel !== 'media' ? styles.panelHidden : ''}
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
