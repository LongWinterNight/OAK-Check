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
  currentUserRole?: string;
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

type ThreadFilter = 'all' | 'open' | 'blocker' | 'resolved';
type ThreadStatus = 'open' | 'blocker' | 'resolved';

const BLOCKER_RE = /(^|\s)(🚨|\[блок(ер)?\]|\[blocker\]|блокер[!:.]|critical[!:.])/i;

export default function CommentsPanel({
  comments,
  currentUserId,
  currentUserRole,
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
  const [filter, setFilter] = useState<ThreadFilter>('all');
  const submittingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (pendingPin) {
      textareaRef.current?.focus();
    }
  }, [pendingPin]);

  const topLevel = comments.filter((c) => !c.parentId);
  const getReplies = (id: string) => comments.filter((c) => c.parentId === id);

  // Статус треда-пина (только для top-level с пином):
  //   blocker = автор пометил тег/смайл-маркером
  //   resolved = есть хотя бы один ответ
  //   open = пин без ответов и без маркера
  const threadStatus = (c: Comment): ThreadStatus | null => {
    if (c.parentId) return null;
    if (c.pinX === null) return null;
    if (BLOCKER_RE.test(c.body)) return 'blocker';
    const replies = comments.filter((x) => x.parentId === c.id);
    return replies.length > 0 ? 'resolved' : 'open';
  };

  const aggregator = topLevel.reduce(
    (acc, c) => {
      const st = threadStatus(c);
      if (st === 'blocker') acc.blocker += 1;
      else if (st === 'open') acc.open += 1;
      else if (st === 'resolved') acc.resolved += 1;
      return acc;
    },
    { blocker: 0, open: 0, resolved: 0 },
  );

  const visibleThreads = topLevel.filter((c) => {
    if (filter === 'all') return true;
    const st = threadStatus(c);
    if (filter === 'open') return st === 'open';
    if (filter === 'blocker') return st === 'blocker';
    if (filter === 'resolved') return st === 'resolved';
    return true;
  });

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

  const headerLabel = `Пины и комментарии`;

  const isAdmin = currentUserRole === 'ADMIN';

  const renderComment = (comment: Comment, isReply = false) => {
    const pinNum = !isReply ? pinnedIndex(comment.id) : null;
    const isOwner = currentUserId && comment.userId === currentUserId;
    const canEdit = isOwner;            // редактировать может только автор
    const canDelete = isOwner || isAdmin; // удалить — автор или ADMIN
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
              {canEdit && onEdit && !isEditing && (
                <button
                  className={styles.iconBtn}
                  title="Редактировать"
                  onClick={() => { setEditingId(comment.id); setReplyOpenFor(null); }}
                >
                  <Icons.Pen size={11} />
                </button>
              )}
              {canDelete && onDelete && (
                <button
                  className={[styles.iconBtn, styles.iconBtnDanger].join(' ')}
                  title={isOwner ? 'Удалить' : 'Удалить (как админ)'}
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

  const totalThreads = topLevel.length;
  const filterTabs: { id: ThreadFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Все', count: totalThreads },
    { id: 'open', label: 'Открытые', count: aggregator.open },
    { id: 'blocker', label: 'Блокеры', count: aggregator.blocker },
    { id: 'resolved', label: 'Решённые', count: aggregator.resolved },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <div className={styles.header}>{headerLabel}</div>
        <div className={styles.aggregator}>
          {aggregator.blocker > 0 && (
            <span className={[styles.aggBadge, styles.aggBlocker].join(' ')}>
              <span className={styles.aggDot} /> {aggregator.blocker} блок.
            </span>
          )}
          {aggregator.open > 0 && (
            <span className={[styles.aggBadge, styles.aggOpen].join(' ')}>
              <span className={styles.aggDot} /> {aggregator.open} откр.
            </span>
          )}
          {aggregator.resolved > 0 && (
            <span className={[styles.aggBadge, styles.aggResolved].join(' ')}>
              <span className={styles.aggDot} /> {aggregator.resolved} решено
            </span>
          )}
        </div>
      </div>

      {totalThreads > 0 && (
        <div className={styles.filterTabs} role="tablist" aria-label="Фильтр пинов">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={filter === t.id}
              className={[styles.filterTab, filter === t.id ? styles.filterTabActive : ''].join(' ')}
              onClick={() => setFilter(t.id)}
              type="button"
            >
              {t.label}
              {t.count > 0 && <span className={styles.filterTabCount}>{t.count}</span>}
            </button>
          ))}
        </div>
      )}

      <div className={styles.list}>
        {topLevel.length === 0 && (
          <div className={styles.empty}>Комментариев пока нет</div>
        )}
        {topLevel.length > 0 && visibleThreads.length === 0 && (
          <div className={styles.empty}>В этой категории пусто</div>
        )}
        {visibleThreads.map((comment) => (
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
