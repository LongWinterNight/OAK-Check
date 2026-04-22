'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import styles from './BottomNav.module.css';

interface BottomNavLinksProps {
  role: string;
  onUpload: () => void;
}

const TABS = [
  { href: '/dashboard', icon: Icons.Grid, label: 'Дашборд' },
  { href: '/tasks',     icon: Icons.List, label: 'Задачи' },
];

const TABS_RIGHT = [
  { href: '/review',   icon: Icons.Eye,  label: 'Ревью' },
  { href: '/settings', icon: Icons.User, label: 'Профиль' },
];

// PM не загружает рендеры сам — кнопка скрыта, добавляем Проекты
const PM_TABS_LEFT = [
  { href: '/dashboard', icon: Icons.Grid,   label: 'Дашборд' },
  { href: '/projects',  icon: Icons.Folder, label: 'Проекты' },
];
const PM_TABS_RIGHT = [
  { href: '/review',   icon: Icons.Eye,      label: 'Ревью' },
  { href: '/settings', icon: Icons.Settings, label: 'Профиль' },
];

export function BottomNavLinks({ role, onUpload }: BottomNavLinksProps) {
  const pathname = usePathname();

  const isPM = role === 'PM';
  const leftTabs  = isPM ? PM_TABS_LEFT  : TABS;
  const rightTabs = isPM ? PM_TABS_RIGHT : TABS_RIGHT;

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  return (
    <nav className={styles.nav} aria-label="Мобильная навигация">
      {leftTabs.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={[styles.tab, isActive(href) ? styles.active : ''].join(' ')}
          aria-label={label}
        >
          <Icon size={22} />
          <span className={styles.label}>{label}</span>
        </Link>
      ))}

      {/* Center upload button — hidden for PM */}
      {!isPM && (
        <div className={styles.uploadWrap}>
          <button
            className={styles.uploadBtn}
            onClick={onUpload}
            aria-label="Загрузить рендер"
          >
            <Icons.Camera size={24} color="#fff" />
          </button>
        </div>
      )}

      {rightTabs.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={[styles.tab, isActive(href) ? styles.active : ''].join(' ')}
          aria-label={label}
        >
          <Icon size={22} />
          <span className={styles.label}>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
