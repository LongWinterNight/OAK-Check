import type { Comment, RenderVersion } from '@/types';
import RenderPreview from './RenderPreview';
import CommentsPanel from './CommentsPanel';
import styles from './RightPanel.module.css';

interface RightPanelProps {
  versions: RenderVersion[];
  comments: Comment[];
  currentUser?: { id: string; name: string };
  currentUserRole?: string;
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
  shotId?: string;
  className?: string;
}

export default function RightPanel({
  versions,
  comments,
  currentUser,
  currentUserRole,
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
  shotId,
  className,
}: RightPanelProps) {
  return (
    <aside className={[styles.panel, className ?? ''].join(' ')}>
      <RenderPreview
        versions={versions}
        comments={comments}
        canDeleteVersion={canDeleteVersion}
        canPin={canPin}
        pendingPin={pendingPin ?? null}
        highlightedCommentId={highlightedCommentId ?? null}
        onHighlight={onHighlight}
        onPinSet={onPinSet}
        onPinClear={onPinClear}
        onLightboxPinSubmit={onLightboxPinSubmit}
        onVersionDeleted={onVersionDeleted}
      />
      <CommentsPanel
        comments={comments}
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
