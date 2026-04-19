'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { href: '/dashboard', icon: Icons.Grid, label: 'Дашборд' },
  { href: '/projects', icon: Icons.Folder, label: 'Проекты' },
  { href: '/kanban', icon: Icons.Kanban, label: 'Канбан' },
  { href: '/library', icon: Icons.Paper, label: 'Библиотека' },
  { href: '/activity', icon: Icons.Bolt, label: 'Активность' },
];

interface NavLinksProps {
  projects: { id: string; name: string; gradient: string }[];
}

export function NavLinks({ projects }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={[styles.navItem, isActive ? styles.active : ''].join(' ')}
          >
            <Icon size={16} />
            <span className={styles.navLabel}>{label}</span>
          </Link>
        );
      })}

      {projects.length > 0 && (
        <>
          <div className={styles.navSection}>Проекты</div>
          {projects.map((p) => {
            const href = `/projects/${p.id}`;
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={p.id}
                href={href}
                className={[styles.navItem, isActive ? styles.active : ''].join(' ')}
              >
                <div
                  style={{
                    width: 14, height: 14, borderRadius: 3,
                    background: p.gradient, flexShrink: 0,
                  }}
                />
                <span className={styles.navLabel}>{p.name}</span>
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}
