'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import ProfileTab from './tabs/ProfileTab';
import TeamTab from './tabs/TeamTab';
import ProjectsTab from './tabs/ProjectsTab';
import AppearanceTab from './tabs/AppearanceTab';
import SystemTab from './tabs/SystemTab';
import styles from './SettingsShell.module.css';

type TabId = 'profile' | 'team' | 'projects' | 'appearance' | 'system';

const ALL_TABS: { id: TabId; label: string; icon: React.ReactNode; desc: string; adminOnly?: boolean }[] = [
  { id: 'profile',    label: 'Профиль',     icon: <Icons.User size={15} />,     desc: 'Личные данные и пароль' },
  { id: 'team',       label: 'Команда',     icon: <Icons.Users size={15} />,    desc: 'Участники и роли',     adminOnly: true },
  { id: 'projects',   label: 'Проекты',     icon: <Icons.Folder size={15} />,   desc: 'Управление проектами' },
  { id: 'appearance', label: 'Внешний вид', icon: <Icons.Grid size={15} />,     desc: 'Тема и интерфейс' },
  { id: 'system',     label: 'Система',     icon: <Icons.Settings size={15} />, desc: 'Статистика и данные',  adminOnly: true },
];

import type { StorageStatus } from '@/lib/storage';

interface SettingsShellProps {
  currentUser: { id: string; name: string; email: string; username?: string | null; role: string; avatarUrl: string | null; lastLoginAt: string | null } | null;
  users: { id: string; name: string; email: string; role: string; online: boolean; avatarUrl: string | null; createdAt: string }[];
  projects: { id: string; title: string; client: string; status: string; shotsCount: number; coverGradient: string; dueDate: string | null }[];
  systemStats: { totalShots: number; totalItems: number; totalComments: number; totalVersions: number };
  storage: StorageStatus | null;
}

export default function SettingsShell({ currentUser, users, projects, systemStats, storage }: SettingsShellProps) {
  const isAdmin = currentUser?.role === 'ADMIN';
  const tabs = ALL_TABS.filter((t) => !t.adminOnly || isAdmin);

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  // Mobile: controls whether the content panel is open (master-detail)
  const [mobileContentOpen, setMobileContentOpen] = useState(false);

  const safeTab = tabs.find((t) => t.id === activeTab) ? activeTab : 'profile';
  const activeTabInfo = tabs.find((t) => t.id === safeTab)!;

  const handleTabClick = (id: TabId) => {
    setActiveTab(id);
    setMobileContentOpen(true);
  };

  const renderContent = () => {
    switch (safeTab) {
      case 'profile':    return <ProfileTab currentUser={currentUser} />;
      case 'team':       return isAdmin ? <TeamTab users={users} isAdmin={isAdmin} currentUserId={currentUser?.id ?? ''} /> : null;
      case 'projects':   return <ProjectsTab projects={projects} isAdmin={isAdmin} />;
      case 'appearance': return <AppearanceTab />;
      case 'system':     return isAdmin ? <SystemTab stats={systemStats} users={users} storage={storage} /> : null;
    }
  };

  return (
    <div className={styles.shell}>
      {/* ── Sidebar (tab list) ────────────────────────────── */}
      {/* On mobile: hidden when content is open */}
      <aside className={[styles.sidebar, mobileContentOpen ? styles.mobileHide : ''].join(' ')}>
        <div className={styles.sidebarHeader}>Настройки</div>
        <nav className={styles.nav}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={[styles.navItem, safeTab === tab.id ? styles.navActive : ''].join(' ')}
            >
              <span className={styles.navIcon}>{tab.icon}</span>
              <div className={styles.navText}>
                <span className={styles.navLabel}>{tab.label}</span>
                <span className={styles.navDesc}>{tab.desc}</span>
              </div>
              <span className={styles.navChevron}><Icons.ChevR size={14} /></span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      {/* On mobile: hidden when content is NOT open; on desktop: always visible */}
      <div className={[styles.mainWrap, !mobileContentOpen ? styles.mobileHide : ''].join(' ')}>
        {/* Back button — only visible on mobile via CSS */}
        <button className={styles.mobileBack} onClick={() => setMobileContentOpen(false)}>
          <Icons.ChevL size={16} />
          <span>{activeTabInfo.label}</span>
        </button>
        <main className={styles.main}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
