import type { Comment, RenderVersion } from '@/types';
import RenderPreview from './RenderPreview';
import CommentsPanel from './CommentsPanel';
import styles from './RightPanel.module.css';

interface RightPanelProps {
  versions: RenderVersion[];
  comments: Comment[];
  currentUser?: { name: string };
  onCommentSubmit?: (body: string) => void;
}

export default function RightPanel({
  versions,
  comments,
  currentUser,
  onCommentSubmit,
}: RightPanelProps) {
  return (
    <aside className={styles.panel}>
      <RenderPreview versions={versions} comments={comments} />
      <CommentsPanel
        comments={comments}
        currentUser={currentUser}
        onSubmit={onCommentSubmit}
      />
    </aside>
  );
}
