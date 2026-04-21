'use client';

import { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui';
import { TemplateCard } from './TemplateCard';
import { ApplyTemplateModal } from './ApplyTemplateModal';
import { NewTemplateModal } from './NewTemplateModal';
import { toast } from '@/components/ui/Toast/toastStore';
import styles from './LibraryClient.module.css';

interface TemplateItem {
  id: string;
  title: string;
  order: number;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  usedCount: number;
  items: TemplateItem[];
}

interface Shot {
  id: string;
  code: string;
  title: string;
}

interface LibraryClientProps {
  templates: Template[];
  shots: Shot[];
  canManage?: boolean;
}

const CATEGORIES = ['Все'];

export function LibraryClient({ templates: initialTemplates, shots, canManage }: LibraryClientProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');
  const [applyTarget, setApplyTarget] = useState<Template | null>(null);
  const [showNew, setShowNew] = useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(templates.map((t) => t.category)));
    return [...CATEGORIES, ...cats];
  }, [templates]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchCat = activeCategory === 'Все' || t.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [templates, activeCategory, search]);

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success(`Шаблон «${name}» удалён`);
    } catch {
      toast.error('Не удалось удалить шаблон');
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Icons.Search size={14} />
          <input
            className={styles.search}
            placeholder="Поиск шаблонов…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')} aria-label="Очистить">
              <Icons.X size={12} />
            </button>
          )}
        </div>

        {canManage && (
          <Button variant="secondary" size="sm" icon={<Icons.Plus size={13} />} onClick={() => setShowNew(true)}>
            Новый шаблон
          </Button>
        )}
      </div>

      <div className={styles.cats}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={[styles.catBtn, activeCategory === cat ? styles.catActive : ''].join(' ')}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Icons.Oak size={32} color="var(--fg-subtle)" />
          <span>Шаблоны не найдены</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              canManage={canManage}
              onApply={setApplyTarget}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {applyTarget && (
        <ApplyTemplateModal
          template={applyTarget}
          shots={shots}
          onClose={() => setApplyTarget(null)}
        />
      )}

      {showNew && (
        <NewTemplateModal
          onClose={() => setShowNew(false)}
          onCreated={(t) => {
            setTemplates((prev) => [t, ...prev]);
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
}
