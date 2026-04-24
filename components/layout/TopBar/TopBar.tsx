'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Button, Input } from '@/components/ui';
import { MobileHeader } from './MobileHeader';
import styles from './TopBar.module.css';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface TopBarProps {
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
}

export default function TopBar({ breadcrumbs = [], action }: TopBarProps) {
  return (
    <header className={styles.topbar}>
      {/* Mobile: logo + avatar — hidden on desktop via CSS */}
      <MobileHeader />

      {/* Desktop: breadcrumbs — hidden on mobile via CSS */}
      <nav className={styles.breadcrumbs} aria-label="Навигация">
        <Link href="/dashboard" className={styles.crumb}>OAK·Check</Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} style={{ display: 'contents' }}>
            <Icons.ChevR size={12} color="var(--fg-subtle)" className={styles.separator} />
            {i === breadcrumbs.length - 1 || !crumb.href ? (
              <span className={styles.crumbActive}>{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className={styles.crumb}>{crumb.label}</Link>
            )}
          </span>
        ))}
      </nav>

      {/* Desktop: search — hidden on mobile via CSS */}
      <Input
        size="sm"
        placeholder="Поиск по шотам, задачам, версиям…"
        className={styles.search}
        iconLeft={<Icons.Search size={13} />}
        aria-label="Глобальный поиск"
      />

      {/* Desktop: actions — hidden on mobile via CSS */}
      <div className={styles.actions}>
        <Button variant="ghost" size="sm" icon={<Icons.Bell size={16} />} aria-label="Уведомления" />
        {action}
      </div>
    </header>
  );
}
