// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OakRing from '@/components/ui/OakRing/OakRing';

describe('OakRing', () => {
  it('рендерит SVG с aria-label процента', () => {
    render(<OakRing value={42} />);
    expect(screen.getByLabelText(/прогресс: 42%/i)).toBeInTheDocument();
  });

  it('текст внутри SVG — округлённое значение', () => {
    const { container } = render(<OakRing value={42.7} />);
    const text = container.querySelector('text');
    expect(text?.textContent).toBe('43');
  });

  it('value=0 → текст «0», dashoffset = circumference', () => {
    const { container } = render(<OakRing value={0} size={44} stroke={3} />);
    const r = (44 - 3) / 2;
    const circumference = 2 * Math.PI * r;
    // Третий circle — арка прогресса (после декоративных + трека)
    const arcs = container.querySelectorAll('circle');
    const progressArc = arcs[arcs.length - 1];
    const offset = parseFloat(progressArc.getAttribute('stroke-dashoffset') ?? '0');
    expect(offset).toBeCloseTo(circumference, 1);
  });

  it('value=100 → dashoffset = 0 (полный круг)', () => {
    const { container } = render(<OakRing value={100} />);
    const arcs = container.querySelectorAll('circle');
    const progressArc = arcs[arcs.length - 1];
    expect(parseFloat(progressArc.getAttribute('stroke-dashoffset') ?? '999')).toBeCloseTo(0, 1);
  });

  it('value=100 — цвет дуги меняется на --done (готово)', () => {
    const { container } = render(<OakRing value={100} />);
    const arcs = container.querySelectorAll('circle');
    const progressArc = arcs[arcs.length - 1];
    expect(progressArc.getAttribute('stroke')).toBe('var(--done)');
  });

  it('value=50 — цвет дуги --accent', () => {
    const { container } = render(<OakRing value={50} />);
    const arcs = container.querySelectorAll('circle');
    const progressArc = arcs[arcs.length - 1];
    expect(progressArc.getAttribute('stroke')).toBe('var(--accent)');
  });

  it('clamp: value < 0 трактуется как 0', () => {
    const { container } = render(<OakRing value={-50} size={44} stroke={3} />);
    const r = (44 - 3) / 2;
    const circumference = 2 * Math.PI * r;
    const arcs = container.querySelectorAll('circle');
    const progressArc = arcs[arcs.length - 1];
    expect(parseFloat(progressArc.getAttribute('stroke-dashoffset') ?? '0')).toBeCloseTo(circumference, 1);
  });

  it('clamp: value > 100 трактуется как 100', () => {
    const { container } = render(<OakRing value={200} />);
    const arcs = container.querySelectorAll('circle');
    const progressArc = arcs[arcs.length - 1];
    expect(parseFloat(progressArc.getAttribute('stroke-dashoffset') ?? '999')).toBeCloseTo(0, 1);
  });

  it('segments=3 → 3 декоративных кольца + 1 трек + 1 прогресс = 5 circle', () => {
    const { container } = render(<OakRing value={50} segments={3} />);
    expect(container.querySelectorAll('circle').length).toBe(5);
  });

  it('segments=0 → только трек + прогресс = 2 circle', () => {
    const { container } = render(<OakRing value={50} segments={0} />);
    expect(container.querySelectorAll('circle').length).toBe(2);
  });

  it('кастомный size меняет размер SVG', () => {
    const { container } = render(<OakRing value={50} size={64} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('64');
    expect(svg?.getAttribute('height')).toBe('64');
  });
});
