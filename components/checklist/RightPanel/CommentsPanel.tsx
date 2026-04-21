'use client';

import { useRef, useState, KeyboardEvent } from 'react';
import Avatar from '@/components/ui/Avatar/Avatar';
import Button from '@/components/ui/Button/Button';
import { Icons } from '@/components/icons';
import type { Comment } from '@/types';
import styles from './CommentsPanel.module.css';

interface CommentsPanelProps {
  comments: Comment[];
  currentUserId?: string;
  currentUser?: { name: string };
  onSubmit?: (body: string, pinX?: number, pinY?: number) => void;
  onDelete?: (commentId: string) => void;
  shotId?: string;
}

export default function CommentsPanel({
  comments, currentUserId, currentUser, onSubmit, onDelete, shotId,
}: CommentsPanelProps) {
  const [draft, setDraft] = useState('');
  const [linkPopover, setLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const topLevel = comments.filter((c) => !c.parentId);
  const getReplies = (id: string) => comments.filter((c) => c.parentId === id);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    if (!draft.trim()) return;
    onSubmit?.(draft.trim());
    setDraft('');
  };

  const insertLink = () => {
    const url = linkUrl.trim();
    if (!url) { setLinkPopover(false); return; }
    const insertion = url.startsWith('http') ? url : `https://${url}`;
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const sel = draft.slice(start, end);
      const md = sel ? `[${sel}](${insertion})` : insertion;
      setDraft(draft.slice(0, start) + md + draft.slice(end));
    } else {
      setDraft((d) => d + (d ? ' ' : '') + insertion);
    }
    setLinkUrl('');
    setLinkPopover(false);
    textareaRef.current?.focus();
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const pinnedIndex = (commentId: string) => {
    const pinned = comments.filter((c) => c.pinX !== null);
    const idx = pinned.findIndex((c) => c.id === commentId);
    return idx >= 0 ? idx + 1 : null;
  };

  const pinnedCount = comments.filter(c => c.pinX !== null).length;
  const headerLabel = `Комментарии${comments.length > 0 ? ` (${comments.length})` : ''}`;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        {headerLabel}
        {pinnedCount > 0 && (
          <span className={styles.pinCount} title={`${pinnedCount} пина на рендере`}>
            <Icons.Dot size={6} /> {pinnedCount} пин.
          </span>
        )}
      </div>

      <div className={styles.list}>
        {topLevel.length === 0 && (
          <div className={styles.empty}>Комментариев пока нет</div>
        )}
        {topLevel.map((comment) => {
          const pinNum = pinnedIndex(comment.id);
          const replies = getReplies(comment.id);
          const canDelete = currentUserId && (comment.userId === currentUserId);
          return (
            <div key={comment.id}>
              <div className={styles.comment}>
                <Avatar name={comment.user.name} size={26} />
                <div className={styles.commentBody}>
                  <div className={styles.commentHead}>
                    <span className={styles.name}>{comment.user.name.split(' ')[0]}</span>
                    <span className={styles.time}>{formatTime(comment.createdAt)}</span>
                    {pinNum && <span className={styles.pinBadge}>{pinNum}</span>}
                    {canDelete && (
                      <button
                        className={styles.deleteBtn}
                        title="Удалить комментарий"
                        onClick={() => onDelete?.(comment.id)}
                      >
                        <Icons.X size={11} />
                      </button>
                    )}
                  </div>
                  <div className={styles.text}>{comment.body}</div>
                </div>
              </div>

              {replies.map((reply) => {
                const canDeleteReply = currentUserId && (reply.userId === currentUserId);
                return (
                  <div key={reply.id} className={[styles.comment, styles.reply].join(' ')}>
                    <Avatar name={reply.user.name} size={22} />
                    <div className={styles.commentBody}>
                      <div className={styles.commentHead}>
                        <span className={styles.name}>{reply.user.name.split(' ')[0]}</span>
                        <span className={styles.time}>{formatTime(reply.createdAt)}</span>
                        {canDeleteReply && (
                          <button
                            className={styles.deleteBtn}
                            title="Удалить"
                            onClick={() => onDelete?.(reply.id)}
                          >
                            <Icons.X size={11} />
                          </button>
                        )}
                      </div>
                      <div className={styles.text}>{reply.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className={styles.composer}>
        <div className={styles.composerTop}>
          <Avatar name={currentUser?.name ?? '?'} size={26} />
          <textarea
            ref={textareaRef}
            className={styles.composerInput}
            placeholder="Написать комментарий… (Enter — отправить)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
        </div>
        <div className={styles.composerBottom}>
          <div className={styles.composerActions}>
            {/* Link insertion */}
            <div style={{ position: 'relative' }}>
              <button
                title="Вставить ссылку"
                className={styles.actionBtn}
                onClick={() => setLinkPopover((v) => !v)}
              >
                <Icons.Link size={14} />
              </button>
              {linkPopover && (
                <div className={styles.linkPopover}>
                  <input
                    className={styles.linkInput}
                    autoFocus
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); insertLink(); }
                      if (e.key === 'Escape') { setLinkPopover(false); setLinkUrl(''); }
                    }}
                  />
                  <button className={styles.linkOk} onClick={insertLink}>OK</button>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            disabled={!draft.trim()}
            onClick={submit}
          >
            Отправить
          </Button>
        </div>
      </div>
    </div>
  );
}
