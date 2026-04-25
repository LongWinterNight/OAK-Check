'use client';

import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import Avatar from '@/components/ui/Avatar/Avatar';
import Button from '@/components/ui/Button/Button';
import { Icons } from '@/components/icons';
import type { Comment } from '@/types';
import styles from './CommentsPanel.module.css';

interface CommentsPanelProps {
  comments: Comment[];
  currentUserId?: string;
  currentUser?: { name: string };
  pendingPin?: { x: number; y: number } | null;
  highlightedCommentId?: string | null;
  onPinClear?: () => void;
  onHighlight?: (commentId: string | null) => void;
  onSubmit?: (body: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (parentId: string, body: string) => void;
  onEdit?: (commentId: string, body: string) => void;
  shotId?: string;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

interface InlineFormProps {
  initial?: string;
  placeholder: string;
  submitLabel: string;
  onSubmit: (body: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

function InlineForm({ initial = '', placeholder, submitLabel, onSubmit, onCancel, autoFocus }: InlineFormProps) {
  const [text, setText] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) {
      ref.current?.focus();
      const len = ref.current?.value.length ?? 0;
      ref.current?.setSelectionRange(len, len);
    }
  }, [autoFocus]);

  const submit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <div className={styles.inlineForm}>
      <textarea
        ref={ref}
        className={styles.inlineInput}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={2}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
        }}
      />
      <div className={styles.inlineActions}>
        <button type="button" className={styles.inlineCancel} onClick={onCancel}>Отмена</button>
        <Button variant="primary" size="sm" disabled={!text.trim()} onClick={submit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

export default function CommentsPanel({
  comments,
  currentUserId,
  currentUser,
  pendingPin = null,
  highlightedCommentId = null,
  onPinClear,
  onHighlight,
  onSubmit,
  onDelete,
  onReply,
  onEdit,
}: CommentsPanelProps) {
  const [draft, setDraft] = useState('');
  const [linkPopover, setLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (pendingPin) {
      textareaRef.current?.focus();
    }
  }, [pendingPin]);

  const topLevel = comments.filter((c) => !c.parentId);
  const getReplies = (id: string) => comments.filter((c) => c.parentId === id);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    if (submittingRef.current) return;
    if (!draft.trim()) return;
    submittingRef.current = true;
    onSubmit?.(draft.trim());
    setDraft('');
    // освобождаем замок на следующем тике — после того как onSubmit инициировал fetch
    window.setTimeout(() => { submittingRef.current = false; }, 600);
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

  const pinnedIndex = (commentId: string) => {
    const pinned = comments.filter((c) => c.pinX !== null);
    const idx = pinned.findIndex((c) => c.id === commentId);
    return idx >= 0 ? idx + 1 : null;
  };

  const pinnedCount = comments.filter(c => c.pinX !== null).length;
  const headerLabel = `Комментарии${comments.length > 0 ? ` (${comments.length})` : ''}`;

  const renderComment = (comment: Comment, isReply = false) => {
    const pinNum = !isReply ? pinnedIndex(comment.id) : null;
    const canMutate = currentUserId && comment.userId === currentUserId;
    const isHighlighted = highlightedCommentId === comment.id;
    const isEditing = editingId === comment.id;

    return (
      <div
        key={comment.id}
        className={[styles.comment, isReply ? styles.reply : '', isHighlighted ? styles.commentHighlighted : ''].join(' ')}
        data-comment-id={comment.id}
        onMouseEnter={() => pinNum && onHighlight?.(comment.id)}
        onMouseLeave={() => pinNum && onHighlight?.(null)}
      >
        <Avatar name={comment.user.name} size={isReply ? 22 : 26} />
        <div className={styles.commentBody}>
          <div className={styles.commentHead}>
            <span className={styles.name}>{comment.user.name.split(' ')[0]}</span>
            <span className={styles.time}>{formatTime(comment.createdAt)}</span>
            {comment.editedAt && (
              <span className={styles.editedTag} title={`изменено в ${formatTime(comment.editedAt)}`}>(изм.)</span>
            )}
            {pinNum && (
              <button
                type="button"
                className={[styles.pinBadge, isHighlighted ? styles.pinBadgeActive : ''].join(' ')}
                title="Найти пин на рендере"
                onClick={() => {
                  onHighlight?.(comment.id);
                  window.setTimeout(() => onHighlight?.(null), 1500);
                }}
              >
                {pinNum}
              </button>
            )}
            <div className={styles.commentActions}>
              {canMutate && onEdit && !isEditing && (
                <button
                  className={styles.iconBtn}
                  title="Редактировать"
                  onClick={() => { setEditingId(comment.id); setReplyOpenFor(null); }}
                >
                  <Icons.Pen size={11} />
                </button>
              )}
              {canMutate && onDelete && (
                <button
                  className={[styles.iconBtn, styles.iconBtnDanger].join(' ')}
                  title="Удалить"
                  onClick={() => onDelete(comment.id)}
                >
                  <Icons.X size={11} />
                </button>
              )}
            </div>
          </div>

          {isEditing && onEdit ? (
            <InlineForm
              initial={comment.body}
              placeholder="Изменить комментарий…"
              submitLabel="Сохранить"
              autoFocus
              onSubmit={(body) => { onEdit(comment.id, body); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className={[styles.text, /\p{L}|\p{N}/u.test(comment.body) ? '' : styles.textEmpty].join(' ')}>
              {/\p{L}|\p{N}/u.test(comment.body) ? comment.body : 'Без описания'}
            </div>
          )}

          {/* Reply — только на верхнем уровне (макс 1 уровень вложенности) */}
          {!isReply && !isEditing && onReply && (
            <button
              className={styles.replyBtn}
              onClick={() => { setReplyOpenFor(replyOpenFor === comment.id ? null : comment.id); setEditingId(null); }}
            >
              <Icons.Msg size={11} /> {pinNum ? `Ответить на пин #${pinNum}` : 'Ответить'}
            </button>
          )}

          {!isReply && replyOpenFor === comment.id && onReply && (
            <InlineForm
              placeholder={pinNum ? `Ответ на пин #${pinNum}…` : 'Ваш ответ…'}
              submitLabel="Ответить"
              autoFocus
              onSubmit={(body) => { onReply(comment.id, body); setReplyOpenFor(null); }}
              onCancel={() => setReplyOpenFor(null)}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        {headerLabel}
        {pinnedCount > 0 && (
          <span className={styles.pinCount} title={`${pinnedCount} пин(ов) на рендере`}>
            <Icons.Dot size={6} /> {pinnedCount} пин.
          </span>
        )}
      </div>

      <div className={styles.list}>
        {topLevel.length === 0 && (
          <div className={styles.empty}>Комментариев пока нет</div>
        )}
        {topLevel.map((comment) => (
          <div key={comment.id} className={styles.thread}>
            {renderComment(comment, false)}
            {getReplies(comment.id).map((reply) => renderComment(reply, true))}
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className={styles.composer}>
        {pendingPin && (
          <div className={styles.pendingPinBar}>
            <span className={styles.pendingPinDot} />
            <span>Привязан к точке на рендере</span>
            <button
              type="button"
              className={styles.pendingPinClear}
              onClick={onPinClear}
              title="Отвязать пин"
            >
              <Icons.X size={11} /> Отвязать
            </button>
          </div>
        )}
        <div className={styles.composerTop}>
          <Avatar name={currentUser?.name ?? '?'} size={26} />
          <textarea
            ref={textareaRef}
            className={styles.composerInput}
            placeholder={pendingPin ? 'Опишите проблему в этой точке…' : 'Написать комментарий… (Enter — отправить)'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
        </div>
        <div className={styles.composerBottom}>
          <div className={styles.composerActions}>
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
            {pendingPin ? 'Отправить с пином' : 'Отправить'}
          </Button>
        </div>
      </div>
    </div>
  );
}
