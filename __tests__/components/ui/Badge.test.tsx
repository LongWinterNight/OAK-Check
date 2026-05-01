// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge/Badge';

describe('Badge', () => {
  it('рендерит children', () => {
    render(<Badge>В работе</Badge>);
    expect(screen.getByText('В работе')).toBeInTheDocument();
  });

  it.each(['neutral', 'done', 'wip', 'blocked', 'info', 'accent', 'oak'] as const)(
    'kind="%s" применяет соответствующий класс',
    (kind) => {
      const { container } = render(<Badge kind={kind}>X</Badge>);
      const badge = container.firstChild as HTMLElement;
      // CSS-модули добавляют хеш — проверяем что класс с именем kind присутствует
      expect(badge.className).toMatch(new RegExp(kind));
    },
  );

  it('size="sm" по умолчанию size="md" — оба применяют размер-класс', () => {
    const { container: c1 } = render(<Badge size="sm">X</Badge>);
    const { container: c2 } = render(<Badge>Y</Badge>);
    expect((c1.firstChild as HTMLElement).className).toMatch(/sm/);
    // md по умолчанию
    expect((c2.firstChild as HTMLElement).className).toMatch(/md/);
  });

  it('dot=true рендерит span с aria-hidden', () => {
    const { container } = render(<Badge dot>В работе</Badge>);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
  });

  it('dot=false (default) — точки нет', () => {
    const { container } = render(<Badge>X</Badge>);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('icon prop рендерится перед текстом', () => {
    render(
      <Badge icon={<span data-testid="ico">★</span>}>Готово</Badge>,
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByText('Готово')).toBeInTheDocument();
  });

  it('className прокидывается дополнительно', () => {
    const { container } = render(<Badge className="my-extra">X</Badge>);
    expect((container.firstChild as HTMLElement).className).toMatch(/my-extra/);
  });
});
