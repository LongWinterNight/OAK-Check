// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from '@/components/ui/Avatar/Avatar';

describe('components/ui/Avatar', () => {
  it('показывает инициалы по 2 словам имени', () => {
    render(<Avatar name="Иван Петров" />);
    expect(screen.getByText('ИП')).toBeInTheDocument();
  });

  it('показывает первые 2 буквы для одного слова', () => {
    render(<Avatar name="Safan" />);
    expect(screen.getByText('SA')).toBeInTheDocument();
  });

  it('инициалы заглавные', () => {
    render(<Avatar name="иван петров" />);
    expect(screen.getByText('ИП')).toBeInTheDocument();
  });

  it('src имеет приоритет над инициалами', () => {
    render(<Avatar name="Иван Петров" src="/api/files/avatar.jpg" />);
    expect(screen.queryByText('ИП')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/files/avatar.jpg');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Иван Петров');
  });

  it('size меняет width/height', () => {
    const { container } = render(<Avatar name="X" size={64} />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('фон выбирается из палитры (стабильный для одного имени)', () => {
    const { container: c1 } = render(<Avatar name="Иван Петров" />);
    const { container: c2 } = render(<Avatar name="Иван Петров" />);
    const bg1 = (c1.firstChild as HTMLElement).style.background;
    const bg2 = (c2.firstChild as HTMLElement).style.background;
    expect(bg1).toBe(bg2);
  });

  it('разные имена обычно дают разные цвета', () => {
    const { container: c1 } = render(<Avatar name="Иван Петров" />);
    const { container: c2 } = render(<Avatar name="Сергей Сидоров" />);
    // Не строгая проверка (могут совпасть для одинаковых charCode-сумм mod 8),
    // но смоук показывает что палитра работает
    const bg1 = (c1.firstChild as HTMLElement).style.background;
    const bg2 = (c2.firstChild as HTMLElement).style.background;
    // оба установлены
    expect(bg1).toBeTruthy();
    expect(bg2).toBeTruthy();
  });

  it('online=true показывает зелёную точку', () => {
    const { container } = render(<Avatar name="X" online />);
    const dot = container.querySelector('span[class*="dot"]');
    expect(dot).toBeTruthy();
    expect(dot?.className).toMatch(/online/);
  });

  it('online=false показывает offline-точку', () => {
    const { container } = render(<Avatar name="X" online={false} />);
    const dot = container.querySelector('span[class*="dot"]');
    expect(dot?.className).toMatch(/offline/);
  });

  it('без online — точки нет', () => {
    const { container } = render(<Avatar name="X" />);
    expect(container.querySelector('span[class*="dot"]')).toBeFalsy();
  });

  it('title содержит полное имя (для tooltip)', () => {
    const { container } = render(<Avatar name="Иван Петров" />);
    expect(container.firstChild).toHaveAttribute('title', 'Иван Петров');
  });

  it('src=null игнорируется (как нет src)', () => {
    render(<Avatar name="Иван Петров" src={null} />);
    expect(screen.getByText('ИП')).toBeInTheDocument();
  });
});
