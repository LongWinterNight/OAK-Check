'use client';

import { Icons } from '@/components/icons';
import { Check3, Avatar, Badge } from '@/components/ui';
import type { ItemState as Check3State } from '@/components/ui/Check3/Check3';
import type { CheckItem, User } from '@/types';
import { dbStateToCheck3, check3ToDbState } from '@/lib/utils';
import styles from './ChecklistRow.module.css';

interface ChecklistRowProps {
  item: CheckItem;
  owner?: User | null;
  selected?: boolean;
  onStateChange: (itemId: string, state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED') => void;
  onClick?: () => void;
}

export default function ChecklistRow({
  item,
  owner,
  selected,
  onStateChange,
  onClick,
}: ChecklistRowProps) {
  const check3State = dbStateToCheck3(item.state);

  const handleChange = (next: Check3State) => {
    onStateChange(item.id, check3ToDbState(next));
  };

  const isBlocked = item.state === 'BLOCKED';
  const isDone = item.state === 'DONE';

  return (
    <div
      className={[styles.row, selected ? styles.selected : ''].join(' ')}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(); }}
      role="row"
      aria-selected={selected}
    >
      {/* 3-state чекбокс */}
      <Check3
        state={check3State}
        onChange={handleChange}
        size={16}
      />

      {/* Контент */}
      <div className={styles.content}>
        <div className={[styles.title, isDone ? styles.titleDone : ''].join(' ')}>
          {item.title}
        </div>
        {item.note && (
          <div className={[styles.note, isBlocked ? styles.noteBlocked : ''].join(' ')}>
            <Icons.Msg size={11} />
            {item.note}
          </div>
        )}
      </div>

      {/* Правая часть */}
      <div className={styles.right}>
        {isBlocked && (
          <Badge kind="blocked" size="sm">Блокер</Badge>
        )}
        {owner && (
          <Avatar name={owner.name} size={22} />
        )}
      </div>
    </div>
  );
}
