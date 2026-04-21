import type { Comment, RenderVersion } from '@/types';
import RenderPreview from './RenderPreview';
import CommentsPanel from './CommentsPanel';
import styles from './RightPanel.module.css';

interface RightPanelProps {
  versions: RenderVersion[];
  comments: Comment[];
  currentUser?: { id: string; name: string };
  canDeleteVersion?: boolean;
  onCommentSubmit?: (body: string, pinX?: number, pinY?: number) => void;
  onCommentDelete?: (commentId: string) => void;
  onVersionDeleted?: (versionId: string) => void;
  shotId?: string;
}

export default function RightPanel({
  versions,
  comments,
  currentUser,
  canDeleteVersion,
  onCommentSubmit,
  onCommentDelete,
  onVersionDeleted,
  shotId,
}: RightPanelProps) {
  return (
    <aside className={styles.panel}>
      <RenderPreview
        versions={versions}
        comments={comments}
        canDeleteVersion={canDeleteVersion}
        onVersionDeleted={onVersionDeleted}
        onAddPin={(pinX, pinY) => onCommentSubmit?.('', pinX, pinY)}
      />
      <CommentsPanel
        comments={comments}
        currentUserId={currentUser?.id}
        currentUser={currentUser}
        onSubmit={onCommentSubmit}
        onDelete={onCommentDelete}
        shotId={shotId}
      />
    </aside>
  );
}
