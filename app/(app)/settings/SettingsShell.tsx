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

const TABS: { id: TabId; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'profile',    label: 'Профиль',       icon: <Icons.User size={15} />,     desc: 'Личные данные и пароль' },
  { id: 'team',       label: 'Команда',        icon: <Icons.Users size={15} />,    desc: 'Участники и роли' },
  { id: 'projects',   label: 'Проекты',        icon: <Icons.Folder size={15} />,   desc: 'Управление проектами' },
  { id: 'appearance', label: 'Внешний вид',    icon: <Icons.Grid size={15} />,     desc: 'Тема и интерфейс' },
  { id: 'system',     label: 'Система',        icon: <Icons.Settings size={15} />, desc: 'Статистика и данные' },
];

interface SettingsShellProps {
  currentUser: { id: string; name: string; email: string; role: string } | null;
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
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className={styles.shell}>
      {/* Боковая навигация */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>Настройки</div>
        <nav className={styles.nav}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[styles.navItem, activeTab === tab.id ? styles.navActive : ''].join(' ')}
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
        {activeTab === 'profile' && <ProfileTab currentUser={currentUser} />}
        {activeTab === 'team' && <TeamTab users={users} isAdmin={isAdmin} currentUserId={currentUser?.id ?? ''} />}
        {activeTab === 'projects' && <ProjectsTab projects={projects} isAdmin={isAdmin} />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'system' && <SystemTab stats={systemStats} users={users} />}
      </main>
    </div>
  );
}
