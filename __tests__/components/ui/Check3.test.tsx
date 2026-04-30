// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import Check3 from '@/components/ui/Check3/Check3';

describe('components/ui/Check3 — трёхпозиционный чекбокс', () => {
  it('рендерится с aria-checked=false для todo', () => {
    const { getByRole } = render(<Check3 state="todo" onChange={() => {}} />);
    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });

  it('aria-checked=mixed для wip', () => {
    const { getByRole } = render(<Check3 state="wip" onChange={() => {}} />);
    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  });

  it('aria-checked=true для done', () => {
    const { getByRole } = render(<Check3 state="done" onChange={() => {}} />);
    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('клик из todo → wip', () => {
    const onChange = vi.fn();
    const { getByRole } = render(<Check3 state="todo" onChange={onChange} />);
    fireEvent.click(getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith('wip');
  });

  it('клик из wip → done', () => {
    const onChange = vi.fn();
    const { getByRole } = render(<Check3 state="wip" onChange={onChange} />);
    fireEvent.click(getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith('done');
  });

  it('клик из done → todo (цикл замыкается)', () => {
    const onChange = vi.fn();
    const { getByRole } = render(<Check3 state="done" onChange={onChange} />);
    fireEvent.click(getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith('todo');
  });

  it('Enter и Space триггерят onChange', () => {
    const onChange = vi.fn();
    const { getByRole } = render(<Check3 state="todo" onChange={onChange} />);
    fireEvent.keyDown(getByRole('checkbox'), { key: 'Enter' });
    fireEvent.keyDown(getByRole('checkbox'), { key: ' ' });
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 'wip');
    expect(onChange).toHaveBeenNthCalledWith(2, 'wip');
  });

  it('disabled — клик не вызывает onChange', () => {
    const onChange = vi.fn();
    const { getByRole } = render(<Check3 state="todo" onChange={onChange} disabled />);
    fireEvent.click(getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled — aria-disabled=true и tabIndex=-1', () => {
    const { getByRole } = render(<Check3 state="todo" onChange={() => {}} disabled />);
    expect(getByRole('checkbox')).toHaveAttribute('aria-disabled', 'true');
    expect(getByRole('checkbox')).toHaveAttribute('tabIndex', '-1');
  });

  it('кастомный size меняет inline width/height', () => {
    const { getByRole } = render(<Check3 state="todo" onChange={() => {}} size={24} />);
    const el = getByRole('checkbox');
    expect(el).toHaveStyle({ width: '24px', height: '24px' });
  });
});
