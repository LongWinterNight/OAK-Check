// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChecklistRow from '@/components/checklist/ItemsList/ChecklistRow';
import type { CheckItem, User } from '@/types';

const mkItem = (overrides: Partial<CheckItem> = {}): CheckItem => ({
  id: overrides.id ?? 'item1',
  shotId: 'shot1',
  chapterId: 'ch1',
  title: overrides.title ?? 'Тестовый пункт',
  state: overrides.state ?? 'TODO',
  ownerId: overrides.ownerId ?? null,
  note: overrides.note ?? null,
  order: 0,
  createdAt: '2026-04-30T10:00:00Z',
  updatedAt: '2026-04-30T10:00:00Z',
});

const mkUser = (overrides: Partial<User> = {}): User => ({
  id: overrides.id ?? 'u1',
  name: overrides.name ?? 'Иван Иванов',
  email: 'ivan@example.com',
  role: 'ARTIST',
  avatarUrl: null,
  online: false,
  createdAt: '2026-01-01T00:00:00Z',
});

describe('ChecklistRow', () => {
  it('рендерит title пункта', () => {
    render(
      <ChecklistRow item={mkItem({ title: 'Сделать рендер' })} onStateChange={() => {}} />,
    );
    expect(screen.getByText('Сделать рендер')).toBeInTheDocument();
  });

  it('Check3 клик переключает state по циклу TODO → WIP', () => {
    const onStateChange = vi.fn();
    render(
      <ChecklistRow item={mkItem({ state: 'TODO' })} onStateChange={onStateChange} />,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onStateChange).toHaveBeenCalledWith('item1', 'WIP');
  });

  it('Check3 клик переключает WIP → DONE', () => {
    const onStateChange = vi.fn();
    render(
      <ChecklistRow item={mkItem({ state: 'WIP' })} onStateChange={onStateChange} />,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onStateChange).toHaveBeenCalledWith('item1', 'DONE');
  });

  it('Check3 клик переключает DONE → TODO (замыкание цикла)', () => {
    const onStateChange = vi.fn();
    render(
      <ChecklistRow item={mkItem({ state: 'DONE' })} onStateChange={onStateChange} />,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onStateChange).toHaveBeenCalledWith('item1', 'TODO');
  });

  it('BLOCKED — Check3 disabled (нельзя сменить кликом)', () => {
    const onStateChange = vi.fn();
    render(
      <ChecklistRow item={mkItem({ state: 'BLOCKED', note: 'жду референс' })} onStateChange={onStateChange} />,
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onStateChange).not.toHaveBeenCalled();
  });

  it('BLOCKED — отображается бейдж «Стоп»', () => {
    render(
      <ChecklistRow item={mkItem({ state: 'BLOCKED', note: 'X' })} onStateChange={() => {}} />,
    );
    expect(screen.getByText(/^стоп$/i)).toBeInTheDocument();
  });

  it('DONE — title зачёркнут (стиль .titleDone)', () => {
    render(
      <ChecklistRow item={mkItem({ state: 'DONE', title: 'Готово' })} onStateChange={() => {}} />,
    );
    const title = screen.getByText('Готово');
    expect(title.className).toMatch(/titleDone/);
  });

  it('canManage=true — двойной клик на title переключает в edit', () => {
    const onRename = vi.fn();
    render(
      <ChecklistRow
        item={mkItem({ title: 'Старое' })}
        canManage
        onStateChange={() => {}}
        onRename={onRename}
      />,
    );
    fireEvent.doubleClick(screen.getByText('Старое'));
    const input = screen.getByDisplayValue('Старое') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Новое название' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onRename).toHaveBeenCalledWith('item1', 'Новое название');
  });

  it('canManage=false — двойной клик на title НЕ переключает в edit', () => {
    render(
      <ChecklistRow
        item={mkItem({ title: 'X' })}
        canManage={false}
        onStateChange={() => {}}
        onRename={() => {}}
      />,
    );
    fireEvent.doubleClick(screen.getByText('X'));
    expect(screen.queryByDisplayValue('X')).toBeNull();
  });

  it('Esc в edit-режиме отменяет изменение title', () => {
    const onRename = vi.fn();
    render(
      <ChecklistRow
        item={mkItem({ title: 'Сохранять' })}
        canManage
        onStateChange={() => {}}
        onRename={onRename}
      />,
    );
    fireEvent.doubleClick(screen.getByText('Сохранять'));
    const input = screen.getByDisplayValue('Сохранять') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Изменённый' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onRename).not.toHaveBeenCalled();
  });

  it('кнопка стопа: если note есть — сразу onFlag(true) без формы', () => {
    const onFlag = vi.fn();
    render(
      <ChecklistRow
        item={mkItem({ note: 'жду референс' })}
        onStateChange={() => {}}
        onFlag={onFlag}
      />,
    );
    fireEvent.click(screen.getByTitle(/поставить на стоп/i));
    expect(onFlag).toHaveBeenCalledWith('item1', true);
  });

  it('кнопка стопа: если note пустой — открывается форма причины', () => {
    const onFlag = vi.fn();
    render(
      <ChecklistRow item={mkItem()} onStateChange={() => {}} onFlag={onFlag} />,
    );
    fireEvent.click(screen.getByTitle(/поставить на стоп/i));
    // onFlag НЕ вызывается сразу — только после commit
    expect(onFlag).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText(/что мешает/i)).toBeInTheDocument();
  });

  it('inline-форма причины: Enter с текстом → onFlag(true, reason)', () => {
    const onFlag = vi.fn();
    render(
      <ChecklistRow item={mkItem()} onStateChange={() => {}} onFlag={onFlag} />,
    );
    fireEvent.click(screen.getByTitle(/поставить на стоп/i));
    const textarea = screen.getByPlaceholderText(/что мешает/i);
    fireEvent.change(textarea, { target: { value: 'жду ассет' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onFlag).toHaveBeenCalledWith('item1', true, 'жду ассет');
  });

  it('inline-форма причины: пустой Enter — закрывает форму без вызова', () => {
    const onFlag = vi.fn();
    render(
      <ChecklistRow item={mkItem()} onStateChange={() => {}} onFlag={onFlag} />,
    );
    fireEvent.click(screen.getByTitle(/поставить на стоп/i));
    const textarea = screen.getByPlaceholderText(/что мешает/i);
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onFlag).not.toHaveBeenCalled();
  });

  it('Esc закрывает форму причины без вызова', () => {
    const onFlag = vi.fn();
    render(
      <ChecklistRow item={mkItem()} onStateChange={() => {}} onFlag={onFlag} />,
    );
    fireEvent.click(screen.getByTitle(/поставить на стоп/i));
    const textarea = screen.getByPlaceholderText(/что мешает/i);
    fireEvent.change(textarea, { target: { value: 'X' } });
    fireEvent.keyDown(textarea, { key: 'Escape' });
    expect(onFlag).not.toHaveBeenCalled();
  });

  it('BLOCKED → клик на флаг снимает стоп (onFlag false)', () => {
    const onFlag = vi.fn();
    render(
      <ChecklistRow
        item={mkItem({ state: 'BLOCKED', note: 'X' })}
        onStateChange={() => {}}
        onFlag={onFlag}
      />,
    );
    fireEvent.click(screen.getByTitle(/снять стоп/i));
    expect(onFlag).toHaveBeenCalledWith('item1', false);
  });

  it('canManage + delete — confirm row → Да вызывает onDelete', () => {
    const onDelete = vi.fn();
    render(
      <ChecklistRow
        item={mkItem()}
        canManage
        onStateChange={() => {}}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByTitle(/удалить пункт/i));
    expect(screen.getByText(/удалить\?/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /да/i }));
    expect(onDelete).toHaveBeenCalledWith('item1');
  });

  it('confirm delete → Нет — отменяет', () => {
    const onDelete = vi.fn();
    render(
      <ChecklistRow
        item={mkItem()}
        canManage
        onStateChange={() => {}}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByTitle(/удалить пункт/i));
    fireEvent.click(screen.getByRole('button', { name: /нет/i }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByText(/удалить\?/i)).toBeNull();
  });

  it('owner отображается через Avatar если canManage=false', () => {
    render(
      <ChecklistRow
        item={mkItem({ ownerId: 'u1' })}
        owner={mkUser({ name: 'Маша' })}
        canManage={false}
        onStateChange={() => {}}
      />,
    );
    // Avatar показывает initials «МА» (но title = «Маша»)
    expect(screen.getByTitle('Маша')).toBeInTheDocument();
  });

  it('canManage + assign dropdown → выбор юзера вызывает onAssign', () => {
    const onAssign = vi.fn();
    render(
      <ChecklistRow
        item={mkItem()}
        canManage
        users={[mkUser({ id: 'u1', name: 'Иван' }), mkUser({ id: 'u2', name: 'Маша' })]}
        onStateChange={() => {}}
        onAssign={onAssign}
      />,
    );
    fireEvent.click(screen.getByTitle(/назначить исполнителя/i));
    fireEvent.click(screen.getByText('Маша'));
    expect(onAssign).toHaveBeenCalledWith('item1', 'u2');
  });

  it('item.note рендерится с иконкой', () => {
    render(
      <ChecklistRow
        item={mkItem({ note: 'Помни про деталь' })}
        onStateChange={() => {}}
      />,
    );
    expect(screen.getByText(/помни про деталь/i)).toBeInTheDocument();
  });
});
