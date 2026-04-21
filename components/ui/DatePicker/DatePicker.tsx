'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '@/components/icons';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  value: string;
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

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function DatePicker({ value, onChange, placeholder = 'дд.мм.гггг', className }: DatePickerProps) {
  const today = new Date();
  const selected = parseISO(value);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Позиционировать дропдаун по координатам кнопки
  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  const handleOpen = () => {
    updatePos();
    setOpen(v => !v);
  };

  // Закрыть при клике снаружи
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const resizeHandler = () => { updatePos(); };
    document.addEventListener('mousedown', handler);
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('scroll', resizeHandler, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('scroll', resizeHandler, true);
    };
  }, [open, updatePos]);

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
    onChange(toISO(new Date(viewYear, viewMonth, day)));
    setOpen(false);
  };

  const selectToday = () => { onChange(toISO(today)); setOpen(false); };
  const clearDate = () => { onChange(''); setOpen(false); };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSelected = (day: number) =>
    !!selected && day === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear();

  const dropdown = (
    <div
      ref={dropdownRef}
      className={styles.dropdown}
      style={{
        position: 'absolute',
        top: dropdownPos.top,
        left: dropdownPos.left,
        minWidth: 272,
        zIndex: 9999,
      }}
    >
      <div className={styles.header}>
        <button type="button" className={styles.navBtn} onClick={prevMonth} aria-label="Пред. месяц">
          <Icons.ChevL size={14} />
        </button>
        <span className={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="След. месяц">
          <Icons.ChevR size={14} />
        </button>
      </div>

      <div className={styles.weekdays}>
        {DAYS.map(d => <span key={d} className={styles.weekday}>{d}</span>)}
      </div>

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

      <div className={styles.footer}>
        <button type="button" className={styles.footerBtn} onClick={clearDate}>Очистить</button>
        <button type="button" className={[styles.footerBtn, styles.footerBtnAccent].join(' ')} onClick={selectToday}>
          Сегодня
        </button>
      </div>
    </div>
  );

  return (
    <div className={[styles.root, className ?? ''].join(' ')}>
      <button
        ref={btnRef}
        type="button"
        className={[styles.input, open ? styles.inputOpen : ''].join(' ')}
        onClick={handleOpen}
      >
        <span className={value ? styles.inputValue : styles.inputPlaceholder}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Icons.Calendar size={14} />
      </button>

      {open && typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}
