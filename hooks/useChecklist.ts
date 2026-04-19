'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChapterWithItems } from '@/types';
import { computeChapterStats } from '@/lib/utils';

async function fetchChecklist(shotId: string): Promise<ChapterWithItems[]> {
  const res = await fetch(`/api/shots/${shotId}/checklist`);
  if (!res.ok) throw new Error('Не удалось загрузить чеклист');
  return res.json();
}

async function patchItem(shotId: string, itemId: string, state: string): Promise<void> {
  const res = await fetch(`/api/shots/${shotId}/checklist/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) throw new Error('Не удалось сохранить изменение');
}

export function useChecklist(shotId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['checklist', shotId];

  const { data: chapters, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchChecklist(shotId),
    enabled: !!shotId,
  });

  const { mutate: updateState } = useMutation({
    mutationFn: ({ itemId, state }: { itemId: string; state: string }) =>
      patchItem(shotId, itemId, state),

    onMutate: async ({ itemId, state }) => {
      await queryClient.cancelQueries({ queryKey });

      const prev = queryClient.getQueryData<ChapterWithItems[]>(queryKey);

      // Оптимистичное обновление
      queryClient.setQueryData<ChapterWithItems[]>(queryKey, (old) => {
        if (!old) return old;
        return old.map((chapter) => {
          const updatedItems = chapter.items.map((item) =>
            item.id === itemId ? { ...item, state: state as ChapterWithItems['items'][0]['state'] } : item
          );
          const stats = computeChapterStats(updatedItems);
          return { ...chapter, items: updatedItems, ...stats };
        });
      });

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(queryKey, ctx.prev);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const totalItems = chapters?.flatMap((c) => c.items) ?? [];
  const totalProgress = totalItems.length === 0
    ? 0
    : Math.round(totalItems.filter((i) => i.state === 'DONE').length / totalItems.length * 100);

  return {
    chapters: chapters ?? [],
    isLoading,
    error,
    updateState,
    totalProgress,
  };
}
