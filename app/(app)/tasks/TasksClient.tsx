'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Check3 from '@/components/ui/Check3/Check3';
import { OakRing } from '@/components/ui';
import { Icons } from '@/components/icons';
import Avatar from '@/components/ui/Avatar/Avatar';
import styles from './page.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TaskItem {
  id: string;
  title: string;
  state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED';
  shotId: string;
  shotCode: string;
  projectId: string;
  chapterTitle: string | null;
}

export interface ShotChapter {
  id: string;
  title: string;
  total: number;
  done: number;
  projectId: string;
  shotId: string;
}

export interface TaskComment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
  pinX?: number | null;
  pinY?: number | null;
}

export interface DayInfo {
  total: number;
  done: number;
  shotCode: string | null;
  projectTitle: string | null;
}

export interface ShotInfo {
  id: string;
  projectId: string;
  latestVersion: string | null;
  pinCount: number;
  previewUrl: string | null;
}

interface Props {
  items: TaskItem[];
  chapters: ShotChapter[];
  comments: TaskComment[];
  day: DayInfo;
  shot: ShotInfo | null;
  currentUserId: string;
}

// ─── Avatar color palette ────────────────────────────────────────────────────
const PALETTE = ['#6366F1','#8B5CF6','#EC4899','#EF4444','#F59E0B','#10B981','#3B82F6','#06B6D4'];
function avatarColor(name: string) {
  const code = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[code % PALETTE.length];
}
function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TasksClient({ items, chapters, comments: initial, day, shot, currentUserId }: Props) {
  const [tab, setTab] = useState<'today' | 'shot' | 'comments'>('today');
  const [itemStates, setItemStates] = useState<Record<string, TaskItem['state']>>(
    Object.fromEntries(items.map((i) => [i.id, i.state]))
  );
  const [comments, setComments] = useState(initial);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Day stats
  const openCount = items.filter((i) => itemStates[i.id] !== 'DONE').length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round(((totalCount - openCount) / totalCount) * 100) : 0;

  const toggleItem = async (item: TaskItem) => {
    const cur = itemStates[item.id];
    const next = cur === 'DONE' ? 'TODO' : cur === 'TODO' ? 'WIP' : 'DONE';
    setItemStates((p) => ({ ...p, [item.id]: next }));
    try {
      await fetch(`/api/shots/${item.shotId}/checklist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: next }),
      });
    } catch {
      setItemStates((p) => ({ ...p, [item.id]: cur }));
    }
  };

  const sendComment = async () => {
    if (!commentText.trim() || !shot) return;
    setSending(true);
    try {
      const res = await fetch(`/api/shots/${shot.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentText.trim() }),
      });
      if (res.ok) {
        const c = await res.json();
        setComments((p) => [...p, c]);
        setCommentText('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
    } finally {
      setSending(false);
    }
  };

  const stateToCheck3 = (s: TaskItem['state']): 'todo' | 'wip' | 'done' => {
    if (s === 'DONE') return 'done';
    if (s === 'WIP') return 'wip';
    return 'todo';
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Day widget */}
      <div className={styles.dayWidget}>
        <div className={styles.dayRing}>
          <OakRing value={progress} size={52} stroke={4} segments={4} />
        </div>
        <div className={styles.dayInfo}>
          <div className={styles.dayLabel}>Мой день</div>
          <div className={styles.dayCount}>
            {totalCount - openCount} из {totalCount} пунктов
          </div>
          {(day.projectTitle || day.shotCode) && (
            <div className={styles.daySub}>
              {[day.projectTitle, day.shotCode].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className={styles.tabs} role="tablist">
        {(['today', 'shot', 'comments'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={[styles.tab, tab === t ? styles.active : ''].join(' ')}
            onClick={() => setTab(t)}
          >
            {t === 'today' ? 'Сегодня' : t === 'shot' ? 'Мой шот' : 'Комментарии'}
          </button>
        ))}
      </div>

      {/* ── TAB: Today ─────────────────────────────────────────────────────── */}
      {tab === 'today' && (
        <div className={styles.tabContent} role="tabpanel">
          {items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><Icons.Check size={32} /></div>
              <div className={styles.emptyTitle}>Все задачи выполнены!</div>
              <div className={styles.emptyText}>Нет активных пунктов чеклиста</div>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {items.map((item) => {
                const state = itemStates[item.id];
                return (
                  <div key={item.id} className={styles.item}>
                    <Check3
                      state={state === 'BLOCKED' ? 'todo' : stateToCheck3(state)}
                      onChange={() => toggleItem(item)}
                      size={18}
                    />
                    <div className={styles.itemBody}>
                      <div className={[styles.itemTitle, state === 'DONE' ? styles.done : ''].join(' ')}>
                        {item.title}
                      </div>
                      {item.chapterTitle && (
                        <div className={styles.itemChapter}>{item.chapterTitle}</div>
                      )}
                    </div>
                    {state === 'WIP' && (
                      <span className={[styles.itemBadge, styles.wipBadge].join(' ')}>WIP</span>
                    )}
                    {state === 'BLOCKED' && (
                      <span className={[styles.itemBadge, styles.blockedBadge].join(' ')}>BLOCKED</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Shot ──────────────────────────────────────────────────────── */}
      {tab === 'shot' && (
        <div className={styles.tabContent} role="tabpanel">
          {!shot ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><Icons.Image size={32} /></div>
              <div className={styles.emptyTitle}>Нет активного шота</div>
              <div className={styles.emptyText}>Вам пока не назначен шот в работе</div>
            </div>
          ) : (
            <>
              {/* Render preview */}
              <div className={styles.renderPreview}>
                {shot.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shot.previewUrl} alt="Рендер" className={styles.renderImg} />
                ) : (
                  <div className={styles.renderPlaceholder}>
                    <Icons.Image size={28} />
                  </div>
                )}
                <div className={styles.renderMeta}>
                  {shot.latestVersion && (
                    <span className={styles.renderBadge}>{shot.latestVersion} · 4K</span>
                  )}
                  {shot.pinCount > 0 && (
                    <span className={styles.pinBadge}>{shot.pinCount}</span>
                  )}
                </div>
              </div>

              {/* Chapters */}
              <div className={styles.chapters}>
                {chapters.length === 0 ? (
                  <div className={styles.empty}>
                    <div className={styles.emptyText}>Нет глав в чеклисте</div>
                  </div>
                ) : (
                  chapters.map((ch) => {
                    const pct = ch.total > 0 ? Math.round((ch.done / ch.total) * 100) : 0;
                    return (
                      <Link
                        key={ch.id}
                        href={`/projects/${ch.projectId}/${ch.shotId}/checklist`}
                        className={styles.chapter}
                      >
                        <OakRing value={pct} size={40} stroke={3} segments={4} />
                        <div className={styles.chapterInfo}>
                          <div className={styles.chapterTitle}>{ch.title}</div>
                          <div className={styles.chapterProgress}>{ch.done}/{ch.total} пунктов</div>
                        </div>
                        <Icons.ChevR size={16} color="var(--fg-subtle)" />
                      </Link>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Comments ──────────────────────────────────────────────────── */}
      {tab === 'comments' && (
        <>
          <div className={styles.tabContent} role="tabpanel">
            {comments.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}><Icons.Msg size={32} /></div>
                <div className={styles.emptyTitle}>Пока нет комментариев</div>
                <div className={styles.emptyText}>Будьте первым — напишите сообщение</div>
              </div>
            ) : (
              <div className={styles.commentsList}>
                {comments.map((c) => (
                  <div key={c.id} className={styles.comment}>
                    <div
                      className={styles.commentAvatar}
                      style={{ background: avatarColor(c.user.name) }}
                      title={c.user.name}
                    >
                      {c.user.avatarUrl ? (
                        <Avatar name={c.user.name} src={c.user.avatarUrl} size={34} />
                      ) : (
                        initials(c.user.name)
                      )}
                    </div>
                    <div className={styles.commentBody}>
                      <div className={styles.commentMeta}>
                        <span className={styles.commentAuthor}>{c.user.name.split(' ')[0]}</span>
                        <span className={styles.commentTime}>{fmtTime(c.createdAt)}</span>
                      </div>
                      <div className={styles.commentText}>{c.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comment input — only if shot exists */}
          {shot && (
            <div className={styles.commentInput}>
              <textarea
                ref={textareaRef}
                className={styles.commentField}
                placeholder="Написать комментарий…"
                value={commentText}
                rows={1}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); }
                }}
              />
              <button
                className={styles.commentSend}
                onClick={sendComment}
                disabled={!commentText.trim() || sending}
                aria-label="Отправить"
              >
                <Icons.ChevR size={16} color="#fff" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
