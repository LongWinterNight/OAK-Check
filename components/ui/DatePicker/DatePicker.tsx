'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Icons } from '@/components/icons';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  value: string;        // ISO: "2026-04-21" или ""
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function parseISO(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplay(iso: string): string {
  const d = parseISO(iso);
  if (!d) return '';
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Пн=0 ... Вс=6
}

export default function DatePicker({ value, onChange, placeholder = 'дд.мм.гггг', className }: DatePickerProps) {
  const today = new Date();
  const selected = parseISO(value);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  const containerRef = useRef<HTMLDivElement>(null);

  // Закрыть при клике снаружи
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Синхронизировать вид с выбранным значением
  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 0) { setViewYear(y => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 11) { setViewYear(y => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const selectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    onChange(toISO(d));
    setOpen(false);
  };

  const selectToday = () => {
    onChange(toISO(today));
    setOpen(false);
  };

  const clearDate = () => {
    onChange('');
    setOpen(false);
  };

  // Построить сетку дней
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Добить до кратного 7
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const isSelected = (day: number) =>
    selected && day === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear();

  return (
    <div className={[styles.root, className ?? ''].join(' ')} ref={containerRef}>
      {/* Инпут */}
      <button
        type="button"
        className={[styles.input, open ? styles.inputOpen : ''].join(' ')}
        onClick={() => setOpen(v => !v)}
      >
        <span className={value ? styles.inputValue : styles.inputPlaceholder}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Icons.Calendar size={14} />
      </button>

      {/* Дропдаун */}
      {open && (
        <div className={styles.dropdown}>
          {/* Хедер: месяц + навигация */}
          <div className={styles.header}>
            <button type="button" className={styles.navBtn} onClick={prevMonth} aria-label="Предыдущий месяц">
              <Icons.ChevL size={14} />
            </button>
            <span className={styles.monthLabel}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="Следующий месяц">
              <Icons.ChevR size={14} />
            </button>
          </div>

          {/* Дни недели */}
          <div className={styles.weekdays}>
            {DAYS.map(d => (
              <span key={d} className={styles.weekday}>{d}</span>
            ))}
          </div>

          {/* Сетка дней */}
          <div className={styles.grid}>
            {cells.map((day, i) => (
              <button
                key={i}
                type="button"
                disabled={!day}
                onClick={() => day && selectDay(day)}
                className={[
                  styles.day,
                  !day ? styles.dayEmpty : '',
                  day && isToday(day) ? styles.dayToday : '',
                  day && isSelected(day) ? styles.daySelected : '',
                ].join(' ')}
              >
                {day ?? ''}
              </button>
            ))}
          </div>

          {/* Футер */}
          <div className={styles.footer}>
            <button type="button" className={styles.footerBtn} onClick={clearDate}>
              Очистить
            </button>
            <button type="button" className={[styles.footerBtn, styles.footerBtnAccent].join(' ')} onClick={selectToday}>
              Сегодня
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
