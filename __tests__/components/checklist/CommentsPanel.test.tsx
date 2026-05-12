// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommentsPanel from '@/components/checklist/RightPanel/CommentsPanel';
import type { Comment } from '@/types';

const mkComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: overrides.id ?? 'c1',
  shotId: 'shot1',
  versionId: overrides.versionId ?? null,
  userId: overrides.userId ?? 'u1',
  body: overrides.body ?? 'Hello',
  pinX: overrides.pinX ?? null,
  pinY: overrides.pinY ?? null,
  parentId: overrides.parentId ?? null,
  createdAt: overrides.createdAt ?? new Date('2026-04-30T12:00:00Z').toISOString(),
  editedAt: overrides.editedAt ?? null,
  user: {
    id: overrides.userId ?? 'u1',
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    role: 'ARTIST',
    avatarUrl: null,
    online: false,
    createdAt: '2026-01-01T00:00:00Z',
  },
});

describe('CommentsPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('пустой state: «Комментариев пока нет»', () => {
    render(<CommentsPanel comments={[]} currentUser={{ name: 'Я' }} />);
    expect(screen.getByText(/комментариев пока нет/i)).toBeInTheDocument();
  });

  it('показывает заголовок «Пины и комментарии»', () => {
    const comments = [mkComment({ id: 'a' }), mkComment({ id: 'b' })];
    render(<CommentsPanel comments={comments} currentUser={{ name: 'Я' }} />);
    expect(screen.getByText(/пины и комментарии/i)).toBeInTheDocument();
  });

  it('показывает агрегатор «N откр.» для пинов без ответов', () => {
    const comments = [
      mkComment({ id: 'a', pinX: 10, pinY: 20 }),
      mkComment({ id: 'b' }),
    ];
    render(<CommentsPanel comments={comments} currentUser={{ name: 'Я' }} />);
    expect(screen.getByText(/1 откр\./i)).toBeInTheDocument();
  });

  it('submit вызывает onSubmit с trimmed body', () => {
    const onSubmit = vi.fn();
    render(
      <CommentsPanel
        comments={[]}
        currentUserId="u1"
        currentUser={{ name: 'Я' }}
        onSubmit={onSubmit}
      />,
    );
    const textarea = screen.getByPlaceholderText(/написать комментарий/i);
    fireEvent.change(textarea, { target: { value: '  Привет  ' } });
    fireEvent.click(screen.getByRole('button', { name: /отправить/i }));
    expect(onSubmit).toHaveBeenCalledWith('Привет');
  });

  it('submit двойным кликом — второй вызов блокируется на 600мс', () => {
    const onSubmit = vi.fn();
    render(
      <CommentsPanel
        comments={[]}
        currentUserId="u1"
        currentUser={{ name: 'Я' }}
        onSubmit={onSubmit}
      />,
    );
    const textarea = screen.getByPlaceholderText(/написать/i);
    fireEvent.change(textarea, { target: { value: 'X' } });
    const btn = screen.getByRole('button', { name: /отправить/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    // Только первый клик прошёл (после очистки draft кнопка disabled,
    // но submittingRef всё равно блокирует до 600мс)
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('Enter в textarea отправляет, Shift+Enter — нет', () => {
    const onSubmit = vi.fn();
    render(
      <CommentsPanel comments={[]} currentUser={{ name: 'Я' }} onSubmit={onSubmit} />,
    );
    const textarea = screen.getByPlaceholderText(/написать/i);
    fireEvent.change(textarea, { target: { value: 'X' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('X');
  });

  it('пустой trim — не отправляет', () => {
    const onSubmit = vi.fn();
    render(
      <CommentsPanel comments={[]} currentUser={{ name: 'Я' }} onSubmit={onSubmit} />,
    );
    const textarea = screen.getByPlaceholderText(/написать/i);
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('pendingPin показывает индикатор и меняет placeholder/кнопку', () => {
    render(
      <CommentsPanel
        comments={[]}
        currentUser={{ name: 'Я' }}
        pendingPin={{ x: 30, y: 40 }}
        onPinClear={() => {}}
      />,
    );
    expect(screen.getByText(/привязан к точке на рендере/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/опишите проблему/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /отправить с пином/i })).toBeInTheDocument();
  });

  it('кнопка «Отвязать» вызывает onPinClear', () => {
    const onPinClear = vi.fn();
    render(
      <CommentsPanel
        comments={[]}
        currentUser={{ name: 'Я' }}
        pendingPin={{ x: 0, y: 0 }}
        onPinClear={onPinClear}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /отвязать/i }));
    expect(onPinClear).toHaveBeenCalled();
  });

  it('бейдж «(изм.)» показывается у отредактированного коммента', () => {
    const comments = [mkComment({ id: 'a', editedAt: '2026-04-30T13:00:00Z' })];
    render(<CommentsPanel comments={comments} currentUser={{ name: 'Я' }} />);
    expect(screen.getByText(/изм\./i)).toBeInTheDocument();
  });

  it('кнопка удалить видна автору, не видна чужому', () => {
    const own = mkComment({ id: 'a', userId: 'u1' });
    const other = mkComment({ id: 'b', userId: 'u2' });
    const { rerender } = render(
      <CommentsPanel
        comments={[own]}
        currentUserId="u1"
        currentUser={{ name: 'Я' }}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByTitle(/^удалить$/i)).toBeInTheDocument();
    rerender(
      <CommentsPanel
        comments={[other]}
        currentUserId="u1"
        currentUser={{ name: 'Я' }}
        onDelete={() => {}}
      />,
    );
    expect(screen.queryByTitle(/удалить/i)).toBeNull();
  });

  it('ADMIN видит «Удалить (как админ)» на чужом комменте', () => {
    const other = mkComment({ id: 'b', userId: 'u2' });
    render(
      <CommentsPanel
        comments={[other]}
        currentUserId="adminUser"
        currentUserRole="ADMIN"
        currentUser={{ name: 'Админ' }}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByTitle(/удалить \(как админ\)/i)).toBeInTheDocument();
  });

  it('кнопка «Ответить» открывает inline-форму', () => {
    const onReply = vi.fn();
    render(
      <CommentsPanel
        comments={[mkComment({ id: 'a' })]}
        currentUser={{ name: 'Я' }}
        onReply={onReply}
      />,
    );
    // Toggle button (изначально единственная)
    fireEvent.click(screen.getByRole('button', { name: /ответить/i }));
    const replyTextarea = screen.getByPlaceholderText(/ваш ответ/i);
    fireEvent.change(replyTextarea, { target: { value: 'Согласен' } });
    // После открытия — две кнопки «Ответить»: toggle + submit. Submit
    // — последняя в DOM-порядке (внутри form.inlineActions)
    const replyButtons = screen.getAllByRole('button', { name: /^ответить$/i });
    fireEvent.click(replyButtons[replyButtons.length - 1]);
    expect(onReply).toHaveBeenCalledWith('a', 'Согласен');
  });

  it('замени «Без описания» если body содержит только эмодзи без букв', () => {
    const comments = [mkComment({ id: 'a', body: '📍' })];
    render(<CommentsPanel comments={comments} currentUser={{ name: 'Я' }} />);
    expect(screen.getByText(/без описания/i)).toBeInTheDocument();
  });
});
