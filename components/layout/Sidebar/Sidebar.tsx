'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import Avatar from '@/components/ui/Avatar/Avatar';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { href: '/dashboard', icon: Icons.Grid, label: 'Дашборд' },
  { href: '/projects', icon: Icons.Folder, label: 'Проекты' },
  { href: '/kanban', icon: Icons.Kanban, label: 'Канбан' },
  { href: '/library', icon: Icons.Paper, label: 'Библиотека' },
  { href: '/activity', icon: Icons.Bolt, label: 'Активность' },
];

const PROJECTS = [
  { id: 'proj_skolkovo', name: 'Skolkovo One', gradient: 'linear-gradient(135deg, #3a5a7a, #1a2a3a)' },
  { id: 'proj_kosmo',    name: 'Kosmo',        gradient: 'linear-gradient(135deg, #5a3a5a, #2a1a2a)' },
  { id: 'proj_beregovoy',name: 'Beregovoy 2',  gradient: 'linear-gradient(135deg, #3a6a5a, #1a2a2a)' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {/* Логотип */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Icons.Oak size={18} color="var(--oak)" />
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>OAK·Check</span>
          <span className={styles.logoSub}>studio · 3DsMax pipeline</span>
        </div>
      </div>

      {/* Project switcher */}
      <div className={styles.projectSwitcher}>
        <button className={styles.projectBtn}>
          <div
            className={styles.projectThumb}
            style={{ background: PROJECTS[0].gradient }}
          />
          <span className={styles.projectName}>{PROJECTS[0].name}</span>
          <Icons.ChevD size={14} color="var(--fg-subtle)" />
        </button>
      </div>

      {/* Навигация */}
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

        {/* Раздел проектов */}
        <div className={styles.navSection}>Проекты</div>
        {PROJECTS.map((p) => {
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
      </nav>

      {/* Пользователь */}
      <div className={styles.userRow}>
        <Avatar name="Артём Ковалёв" size={26} online />
        <div className={styles.userInfo}>
          <div className={styles.userName}>Артём Ковалёв</div>
          <div className={styles.userRole}>3D Artist</div>
        </div>
        <Icons.Settings size={14} color="var(--fg-subtle)" />
      </div>
    </aside>
  );
}
