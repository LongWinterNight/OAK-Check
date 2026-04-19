'use client';

import { useState, KeyboardEvent } from 'react';
import Avatar from '@/components/ui/Avatar/Avatar';
import Button from '@/components/ui/Button/Button';
import { Icons } from '@/components/icons';
import type { Comment } from '@/types';
import styles from './CommentsPanel.module.css';

interface CommentsPanelProps {
  comments: Comment[];
  currentUser?: { name: string };
  onSubmit?: (body: string) => void;
}

export default function CommentsPanel({ comments, currentUser, onSubmit }: CommentsPanelProps) {
  const [draft, setDraft] = useState('');

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

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const pinnedIndex = (commentId: string) => {
    const pinned = comments.filter((c) => c.pinX !== null).findIndex((c) => c.id === commentId);
    return pinned >= 0 ? pinned + 1 : null;
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>Комментарии</div>

      <div className={styles.list}>
        {topLevel.map((comment) => {
          const pinNum = pinnedIndex(comment.id);
          const replies = getReplies(comment.id);
          return (
            <div key={comment.id}>
              <div className={styles.comment}>
                <Avatar name={comment.user.name} size={26} />
                <div className={styles.commentBody}>
                  <div className={styles.commentHead}>
                    <span className={styles.name}>{comment.user.name.split(' ')[0]}</span>
                    <span className={styles.time}>{formatTime(comment.createdAt)}</span>
                    {pinNum && <span className={styles.pinBadge}>{pinNum}</span>}
                  </div>
                  <div className={styles.text}>{comment.body}</div>
                </div>
              </div>

              {/* Ответы */}
              {replies.map((reply) => (
                <div key={reply.id} className={[styles.comment, styles.reply].join(' ')}>
                  <Avatar name={reply.user.name} size={22} />
                  <div className={styles.commentBody}>
                    <div className={styles.commentHead}>
                      <span className={styles.name}>{reply.user.name.split(' ')[0]}</span>
                      <span className={styles.time}>{formatTime(reply.createdAt)}</span>
                    </div>
                    <div className={styles.text}>{reply.body}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className={styles.composer}>
        <div className={styles.composerTop}>
          <Avatar name={currentUser?.name ?? 'Артём Ковалёв'} size={26} />
          <textarea
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
            <button title="Прикрепить изображение" aria-label="Прикрепить изображение">
              <Icons.Image size={14} />
            </button>
            <button title="Вставить ссылку" aria-label="Вставить ссылку">
              <Icons.Link size={14} />
            </button>
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
