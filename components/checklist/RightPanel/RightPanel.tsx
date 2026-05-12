'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Comment, RenderVersion } from '@/types';
import RenderPreview from './RenderPreview';
import CommentsPanel from './CommentsPanel';
import styles from './RightPanel.module.css';

interface RightPanelProps {
  versions: RenderVersion[];
  comments: Comment[];
  currentUser?: { id: string; name: string };
  currentUserRole?: string;
  shotCode?: string;
  shotTitle?: string;
  canDeleteVersion?: boolean;
  canPin?: boolean;
  pendingPin?: { x: number; y: number } | null;
  highlightedCommentId?: string | null;
  onHighlight?: (commentId: string | null) => void;
  onPinSet?: (pinX: number, pinY: number) => void;
  onPinClear?: () => void;
  onCommentSubmit?: (body: string) => void;
  onCommentDelete?: (commentId: string) => void;
  onCommentReply?: (parentId: string, body: string) => void;
  onCommentEdit?: (commentId: string, body: string) => void;
  onLightboxPinSubmit?: (body: string, x: number, y: number) => Promise<unknown>;
  onVersionDeleted?: (versionId: string) => void;
  onActiveVersionChange?: (versionId: string | null) => void;
  shotId?: string;
  className?: string;
}

export default function RightPanel({
  versions,
  comments,
  currentUser,
  currentUserRole,
  shotCode,
  shotTitle,
  canDeleteVersion,
  canPin = false,
  pendingPin,
  highlightedCommentId,
  onHighlight,
  onPinSet,
  onPinClear,
  onCommentSubmit,
  onCommentDelete,
  onCommentReply,
  onCommentEdit,
  onLightboxPinSubmit,
  onVersionDeleted,
  onActiveVersionChange,
  shotId,
  className,
}: RightPanelProps) {
  // Активная версия — единый источник правды для preview, lightbox и
  // фильтрации комментариев. По умолчанию — последняя.
  const latestVersion = versions.length > 0 ? versions[versions.length - 1] : null;
  const [activeVersionId, setActiveVersionId] = useState<string | null>(latestVersion?.id ?? null);

  // Если список версий поменялся (загрузили новую — handleUploaded в parent),
  // и активной больше нет — переключаемся на последнюю.
  useEffect(() => {
    if (!activeVersionId || !versions.some((v) => v.id === activeVersionId)) {
      setActiveVersionId(latestVersion?.id ?? null);
    }
  }, [versions, activeVersionId, latestVersion?.id]);

  // Пробрасываем активную версию наверх — чтобы ChecklistClient мог
  // прицеплять versionId к новым комментам/пинам.
  useEffect(() => {
    onActiveVersionChange?.(activeVersionId);
  }, [activeVersionId, onActiveVersionChange]);

  // Комменты для активной версии. Legacy-комменты (versionId === null,
  // созданные до миграции) показываем на ВСЕХ версиях как fallback.
  const versionComments = useMemo(() => {
    if (!activeVersionId) return comments;
    return comments.filter((c) => c.versionId === activeVersionId || c.versionId === null);
  }, [comments, activeVersionId]);

  const activeVersion = versions.find((v) => v.id === activeVersionId) ?? null;

  return (
    <aside className={[styles.panel, className ?? ''].join(' ')}>
      <RenderPreview
        versions={versions}
        comments={versionComments}
        activeVersion={activeVersion?.version ?? ''}
        onActiveVersionChange={(version) => {
          const found = versions.find((v) => v.version === version);
          setActiveVersionId(found?.id ?? null);
        }}
        shotCode={shotCode}
        shotTitle={shotTitle}
        canDeleteVersion={canDeleteVersion}
        canPin={canPin}
        pendingPin={pendingPin ?? null}
        highlightedCommentId={highlightedCommentId ?? null}
        onHighlight={onHighlight}
        onPinSet={onPinSet}
        onPinClear={onPinClear}
        onLightboxPinSubmit={onLightboxPinSubmit}
        onVersionDeleted={onVersionDeleted}
        currentUser={currentUser}
        currentUserRole={currentUserRole}
        shotId={shotId}
        onCommentSubmit={onCommentSubmit}
        onCommentDelete={onCommentDelete}
        onCommentReply={onCommentReply}
        onCommentEdit={onCommentEdit}
      />
      <CommentsPanel
        comments={versionComments}
        currentUserId={currentUser?.id}
        currentUserRole={currentUserRole}
        currentUser={currentUser}
        pendingPin={pendingPin ?? null}
        highlightedCommentId={highlightedCommentId ?? null}
        onHighlight={onHighlight}
        onPinClear={onPinClear}
        onSubmit={onCommentSubmit}
        onDelete={onCommentDelete}
        onReply={onCommentReply}
        onEdit={onCommentEdit}
        shotId={shotId}
      />
    </aside>
  );
}
