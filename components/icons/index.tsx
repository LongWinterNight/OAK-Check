import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Ico = ({
  children,
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.6,
  className,
  style,
}: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    className={className}
  >
    {children}
  </svg>
);

export const Icons = {
  Check: (p: IconProps) => (
    <Ico {...p}><path d="M4 10.5l3.5 3.5L16 5.5" /></Ico>
  ),
  Plus: (p: IconProps) => (
    <Ico {...p}><path d="M10 4v12M4 10h12" /></Ico>
  ),
  Minus: (p: IconProps) => (
    <Ico {...p}><path d="M4 10h12" /></Ico>
  ),
  X: (p: IconProps) => (
    <Ico {...p}><path d="M5 5l10 10M15 5L5 15" /></Ico>
  ),
  ChevR: (p: IconProps) => (
    <Ico {...p}><path d="M8 5l5 5-5 5" /></Ico>
  ),
  ChevD: (p: IconProps) => (
    <Ico {...p}><path d="M5 8l5 5 5-5" /></Ico>
  ),
  ChevL: (p: IconProps) => (
    <Ico {...p}><path d="M12 5l-5 5 5 5" /></Ico>
  ),
  Search: (p: IconProps) => (
    <Ico {...p}><circle cx="9" cy="9" r="5" /><path d="M13 13l3 3" /></Ico>
  ),
  Filter: (p: IconProps) => (
    <Ico {...p}><path d="M3 5h14M6 10h8M9 15h2" /></Ico>
  ),
  Bell: (p: IconProps) => (
    <Ico {...p}><path d="M5 15V9a5 5 0 0110 0v6M3 15h14M8 17a2 2 0 004 0" /></Ico>
  ),
  User: (p: IconProps) => (
    <Ico {...p}><circle cx="10" cy="7" r="3" /><path d="M4 17c0-3 3-5 6-5s6 2 6 5" /></Ico>
  ),
  Folder: (p: IconProps) => (
    <Ico {...p}><path d="M3 6a1 1 0 011-1h4l2 2h6a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" /></Ico>
  ),
  List: (p: IconProps) => (
    <Ico {...p}><path d="M3 5h14M3 10h14M3 15h14" /></Ico>
  ),
  Grid: (p: IconProps) => (
    <Ico {...p}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </Ico>
  ),
  Kanban: (p: IconProps) => (
    <Ico {...p}>
      <rect x="3" y="3" width="4" height="14" rx="1" />
      <rect x="9" y="3" width="4" height="9" rx="1" />
      <rect x="15" y="3" width="2" height="12" rx="1" />
    </Ico>
  ),
  Calendar: (p: IconProps) => (
    <Ico {...p}>
      <rect x="3" y="5" width="14" height="12" rx="1.5" />
      <path d="M3 9h14M7 3v4M13 3v4" />
    </Ico>
  ),
  Image: (p: IconProps) => (
    <Ico {...p}>
      <rect x="3" y="4" width="14" height="12" rx="1.5" />
      <circle cx="7" cy="8" r="1.3" />
      <path d="M17 13l-4-4-7 7" />
    </Ico>
  ),
  Paper: (p: IconProps) => (
    <Ico {...p}>
      <path d="M5 3h7l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M12 3v4h4" />
    </Ico>
  ),
  Upload: (p: IconProps) => (
    <Ico {...p}><path d="M10 14V4M6 8l4-4 4 4M4 16h12" /></Ico>
  ),
  Link: (p: IconProps) => (
    <Ico {...p}>
      <path d="M8 12a3 3 0 010-4l2-2a3 3 0 014 4l-1 1" />
      <path d="M12 8a3 3 0 010 4l-2 2a3 3 0 01-4-4l1-1" />
    </Ico>
  ),
  Msg: (p: IconProps) => (
    <Ico {...p}><path d="M4 5h12a1 1 0 011 1v8a1 1 0 01-1 1h-7l-3 3v-3H4a1 1 0 01-1-1V6a1 1 0 011-1z" /></Ico>
  ),
  Eye: (p: IconProps) => (
    <Ico {...p}>
      <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" />
      <circle cx="10" cy="10" r="2.5" />
    </Ico>
  ),
  Play: (p: IconProps) => (
    <Ico {...p}><path d="M6 4l10 6-10 6V4z" fill="currentColor" stroke="none" /></Ico>
  ),
  Pause: (p: IconProps) => (
    <Ico {...p} strokeWidth={0}>
      <rect x="5" y="4" width="3" height="12" rx="0.5" fill="currentColor" />
      <rect x="12" y="4" width="3" height="12" rx="0.5" fill="currentColor" />
    </Ico>
  ),
  Dot: (p: IconProps) => (
    <Ico {...p} strokeWidth={0}><circle cx="10" cy="10" r="6" fill="currentColor" /></Ico>
  ),
  More: (p: IconProps) => (
    <Ico {...p} strokeWidth={0}>
      <circle cx="5" cy="10" r="1.2" fill="currentColor" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
    </Ico>
  ),
  Moon: (p: IconProps) => (
    <Ico {...p}><path d="M16 11a6 6 0 01-7-8 7 7 0 107 8z" /></Ico>
  ),
  Sun: (p: IconProps) => (
    <Ico {...p}>
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4 4l1 1M15 15l1 1M4 16l1-1M15 5l1-1" />
    </Ico>
  ),
  Settings: (p: IconProps) => (
    <Ico {...p}>
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.5 1.5M14.3 14.3l1.5 1.5M4.2 15.8l1.5-1.5M14.3 5.7l1.5-1.5" />
    </Ico>
  ),
  Sparkle: (p: IconProps) => (
    <Ico {...p}><path d="M10 3l1.5 4.5L16 9l-4.5 1.5L10 15l-1.5-4.5L4 9l4.5-1.5z" /></Ico>
  ),
  Camera: (p: IconProps) => (
    <Ico {...p}>
      <path d="M3 7a1 1 0 011-1h2l1.5-2h5L13 6h3a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" />
      <circle cx="10" cy="11" r="3" />
    </Ico>
  ),
  Cube: (p: IconProps) => (
    <Ico {...p}>
      <path d="M10 2l7 4v8l-7 4-7-4V6z" />
      <path d="M3 6l7 4 7-4M10 10v8" />
    </Ico>
  ),
  Layers: (p: IconProps) => (
    <Ico {...p}><path d="M10 3L3 7l7 4 7-4-7-4zM3 13l7 4 7-4M3 10l7 4 7-4" /></Ico>
  ),
  Flag: (p: IconProps) => (
    <Ico {...p}><path d="M5 17V3M5 3h10l-2 3.5L15 10H5" /></Ico>
  ),
  Bolt: (p: IconProps) => (
    <Ico {...p}><path d="M11 2L4 11h5l-1 7 7-9h-5l1-7z" /></Ico>
  ),
  Clock: (p: IconProps) => (
    <Ico {...p}><circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 2" /></Ico>
  ),
  Users: (p: IconProps) => (
    <Ico {...p}>
      <circle cx="7" cy="7" r="3" />
      <path d="M1 17c0-3 2.5-5 6-5" />
      <circle cx="14" cy="7" r="3" />
      <path d="M19 17c0-3-2.5-5-6-5s-6 2-6 5" />
    </Ico>
  ),
  AlertTriangle: (p: IconProps) => (
    <Ico {...p}><path d="M10 4L2 17h16L10 4zM10 10v4M10 15.5v.5" /></Ico>
  ),
  MessageSquare: (p: IconProps) => (
    <Ico {...p}><path d="M4 5h12a1 1 0 011 1v8a1 1 0 01-1 1h-7l-3 3v-3H4a1 1 0 01-1-1V6a1 1 0 011-1z" /></Ico>
  ),
  // Логотип OAK — дубовый лист (фирменный элемент)
  Oak: ({ size = 20, color = 'currentColor', className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path
        d="M16 3c1.5 2 2 3.5 2 5.2 1.4-.8 2.8-1 4.4-.6-.2 1.8-1 3-2.4 3.9 1.6.2 2.9.9 4 2-1.3 1.4-2.8 2-4.5 2 1.5.9 2.4 2.2 2.8 4-1.8.2-3.3-.2-4.6-1.3.3 1.6 0 3-1 4.4-1-1.4-1.5-2.8-1.2-4.4-1.3 1.1-2.8 1.5-4.6 1.3.4-1.8 1.3-3.1 2.8-4-1.7 0-3.2-.6-4.5-2 1.1-1.1 2.4-1.8 4-2-1.4-.9-2.2-2.1-2.4-3.9 1.6-.4 3-.2 4.4.6 0-1.7.5-3.2 2-5.2z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 10v18" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  // Жёлудь (декоративный маркер)
  Acorn: ({ size = 18, color = 'currentColor', className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 9c0-1.5 1-3 6-3s6 1.5 6 3c0 .8-.5 1.5-1.5 2h-9C6.5 10.5 6 9.8 6 9z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 11c0 4 2 8 4.5 8s4.5-4 4.5-8"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 3v3" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

export type IconName = keyof typeof Icons;
