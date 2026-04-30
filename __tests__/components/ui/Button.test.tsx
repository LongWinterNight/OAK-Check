// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import Button from '@/components/ui/Button/Button';

describe('components/ui/Button', () => {
  it('рендерит children', () => {
    render(<Button>Сохранить</Button>);
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument();
  });

  it('по умолчанию variant=secondary, size=md (классы применены)', () => {
    const { container } = render(<Button>X</Button>);
    const btn = container.querySelector('button')!;
    expect(btn.className).toMatch(/secondary/);
    expect(btn.className).toMatch(/md/);
  });

  it('disabled — клик не срабатывает', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>X</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading — показывает спиннер вместо children, кнопка disabled', () => {
    const onClick = vi.fn();
    const { container } = render(<Button loading onClick={onClick}>Click</Button>);
    expect(screen.queryByText('Click')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-label="Загрузка"]')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('icon рендерится перед children', () => {
    render(<Button icon={<span data-testid="icon" />}>Текст</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Текст')).toBeInTheDocument();
  });

  it('iconRight рендерится после children', () => {
    render(<Button iconRight={<span data-testid="iconR" />}>Текст</Button>);
    expect(screen.getByTestId('iconR')).toBeInTheDocument();
  });

  it('fullWidth — добавляет fullWidth класс', () => {
    const { container } = render(<Button fullWidth>X</Button>);
    expect(container.querySelector('button')!.className).toMatch(/fullWidth/);
  });

  it('пропускает type="submit" через ...rest', () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('все варианты кнопки рендерятся (smoke)', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger', 'outline'] as const;
    for (const v of variants) {
      const { container, unmount } = render(<Button variant={v}>{v}</Button>);
      expect(container.querySelector('button')!.className).toMatch(new RegExp(v));
      unmount();
    }
  });

  it('все размеры рендерятся (smoke)', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    for (const s of sizes) {
      const { container, unmount } = render(<Button size={s}>{s}</Button>);
      expect(container.querySelector('button')!.className).toMatch(new RegExp(s));
      unmount();
    }
  });
});
