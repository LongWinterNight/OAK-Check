// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';

describe('ProgressBar', () => {
  it('role="progressbar" с aria-valuenow', () => {
    render(<ProgressBar value={42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('width fill = value%', () => {
    render(<ProgressBar value={73} />);
    const fill = screen.getByRole('progressbar').firstChild as HTMLElement;
    expect(fill.style.width).toBe('73%');
  });

  it('clamp value < 0 → 0', () => {
    render(<ProgressBar value={-10} />);
    const bar = screen.getByRole('progressbar');
    const fill = bar.firstChild as HTMLElement;
    expect(fill.style.width).toBe('0%');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamp value > 100 → 100', () => {
    render(<ProgressBar value={150} />);
    const bar = screen.getByRole('progressbar');
    const fill = bar.firstChild as HTMLElement;
    expect(fill.style.width).toBe('100%');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('кастомный height применяется к треку', () => {
    render(<ProgressBar value={50} height={12} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveStyle({ height: '12px' });
  });

  it('кастомный color применяется к fill', () => {
    render(<ProgressBar value={50} color="#ff0000" />);
    const fill = screen.getByRole('progressbar').firstChild as HTMLElement;
    expect(fill.style.background).toBe('rgb(255, 0, 0)');
  });

  it('value=0 — fill 0%', () => {
    render(<ProgressBar value={0} />);
    const fill = screen.getByRole('progressbar').firstChild as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });
});
