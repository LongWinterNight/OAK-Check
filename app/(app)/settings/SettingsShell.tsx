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
  { id: 'profile',    label: 'Профиль',       icon: <Icons.User size={15} />,     desc: 'Личные данные и пароль' },
  { id: 'team',       label: 'Команда',        icon: <Icons.Users size={15} />,    desc: 'Участники и роли',      adminOnly: true },
  { id: 'projects',   label: 'Проекты',        icon: <Icons.Folder size={15} />,   desc: 'Управление проектами' },
  { id: 'appearance', label: 'Внешний вид',    icon: <Icons.Grid size={15} />,     desc: 'Тема и интерфейс' },
  { id: 'system',     label: 'Система',        icon: <Icons.Settings size={15} />, desc: 'Статистика и данные',   adminOnly: true },
];

interface SettingsShellProps {
  currentUser: { id: string; name: string; email: string; role: string; avatarUrl: string | null; lastLoginAt: string | null } | null;
  users: {
    id: string; name: string; email: string; role: string;
    online: boolean; avatarUrl: string | null; createdAt: string;
  }[];
  projects: {
    id: string; title: string; client: string; status: string;
    shotsCount: number; coverGradient: string; dueDate: string | null;
  }[];
  systemStats: {
    totalShots: number; totalItems: number; totalComments: number; totalVersions: number;
  };
}

export default function SettingsShell({ currentUser, users, projects, systemStats }: SettingsShellProps) {
  const isAdmin = currentUser?.role === 'ADMIN';
  const tabs = ALL_TABS.filter((t) => !t.adminOnly || isAdmin);
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const safeTab = tabs.find((t) => t.id === activeTab) ? activeTab : 'profile';

  return (
    <div className={styles.shell}>
      {/* Боковая навигация */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>Настройки</div>
        <nav className={styles.nav}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[styles.navItem, safeTab === tab.id ? styles.navActive : ''].join(' ')}
            >
              <span className={styles.navIcon}>{tab.icon}</span>
              <div className={styles.navText}>
                <span className={styles.navLabel}>{tab.label}</span>
                <span className={styles.navDesc}>{tab.desc}</span>
              </div>
            </button>
          ))}
        </nav>
      </aside>

      {/* Контент таба */}
      <main className={styles.main}>
        {safeTab === 'profile' && <ProfileTab currentUser={currentUser} />}
        {safeTab === 'team' && isAdmin && <TeamTab users={users} isAdmin={isAdmin} currentUserId={currentUser?.id ?? ''} />}
        {safeTab === 'projects' && <ProjectsTab projects={projects} isAdmin={isAdmin} />}
        {safeTab === 'appearance' && <AppearanceTab />}
        {safeTab === 'system' && isAdmin && <SystemTab stats={systemStats} users={users} />}
      </main>
    </div>
  );
}
