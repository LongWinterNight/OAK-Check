'use client';

import { useState } from 'react';
import Check3, { type ItemState } from '@/components/ui/Check3/Check3';
import styles from './MyDay.module.css';

const MY_TASKS = [
  { id: '1', title: 'Оптимизация плотности: карнизы', project: 'Skolkovo One · SH04', time: '14:00', state: 'todo' as ItemState },
  { id: '2', title: 'Проверить HDRI multiplier', project: 'Skolkovo One · SH04', time: '14:30', state: 'wip' as ItemState },
  { id: '3', title: 'Тестовый рендер 1080p', project: 'Kosmo · SH02', time: '16:00', state: 'todo' as ItemState },
];

export default function MyDay() {
  const [tasks, setTasks] = useState(MY_TASKS);

  const toggle = (id: string, next: ItemState) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, state: next } : t));
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Мой день</span>
        <span className={styles.count}>{tasks.filter(t => t.state !== 'done').length} задач</span>
      </div>
      <div className={styles.list}>
        {tasks.map((task) => (
          <div key={task.id} className={styles.item}>
            <Check3 state={task.state} onChange={(next) => toggle(task.id, next)} size={16} />
            <div className={styles.info}>
              <div className={[styles.taskTitle, task.state === 'done' ? styles.done : ''].join(' ')}>
                {task.title}
              </div>
              <div className={styles.project}>{task.project}</div>
            </div>
            <span className={styles.time}>{task.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
