import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем сидирование базы данных OAK·Check...');

  // Очищаем в правильном порядке
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.checkItem.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.renderVersion.deleteMany();
  await prisma.shot.deleteMany();
  await prisma.project.deleteMany();
  await prisma.templateItem.deleteMany();
  await prisma.checklistTemplate.deleteMany();
  await prisma.user.deleteMany();

  // ===== ПОЛЬЗОВАТЕЛИ =====
  const users = await Promise.all([
    prisma.user.create({
      data: { id: 'u1', email: 'artem@oak3d.ru', name: 'Артём Ковалёв', role: 'ARTIST', online: true },
    }),
    prisma.user.create({
      data: { id: 'u2', email: 'dasha@oak3d.ru', name: 'Дарья Лин', role: 'LEAD', online: true },
    }),
    prisma.user.create({
      data: { id: 'u3', email: 'misha@oak3d.ru', name: 'Миша Петров', role: 'ARTIST', online: false },
    }),
    prisma.user.create({
      data: { id: 'u4', email: 'katya@oak3d.ru', name: 'Катя Смирнова', role: 'QA', online: false },
    }),
    prisma.user.create({
      data: { id: 'u5', email: 'ivan@oak3d.ru', name: 'Иван Сорокин', role: 'POST', online: false },
    }),
  ]);
  console.log(`✓ Создано ${users.length} пользователей`);

  // ===== ПРОЕКТЫ =====
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        id: 'proj_skolkovo',
        title: 'Skolkovo One',
        client: 'Ikon Development',
        coverGradient: 'linear-gradient(135deg, #3a5a7a, #1a2a3a)',
        status: 'ACTIVE',
      },
    }),
    prisma.project.create({
      data: {
        id: 'proj_primavera',
        title: 'Primavera',
        client: 'Spartak',
        coverGradient: 'linear-gradient(135deg, #7a5a3a, #3a2a1a)',
        status: 'COMPLETED',
      },
    }),
    prisma.project.create({
      data: {
        id: 'proj_kosmo',
        title: 'Kosmo',
        client: 'Gals',
        coverGradient: 'linear-gradient(135deg, #5a3a5a, #2a1a2a)',
        status: 'ACTIVE',
      },
    }),
    prisma.project.create({
      data: {
        id: 'proj_beregovoy',
        title: 'Beregovoy 2',
        client: 'Glavstroy',
        coverGradient: 'linear-gradient(135deg, #3a6a5a, #1a2a2a)',
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log(`✓ Создано ${projects.length} проекта`);

  // ===== ГЛАВЫ ШАБЛОНА =====
  const chapterDefs = [
    { key: 'pre',   title: 'Pre-production',       desc: 'Бриф, рефы, планировка', order: 0 },
    { key: 'mod',   title: 'Моделирование',         desc: 'Геометрия, топология, UVW', order: 1 },
    { key: 'scene', title: 'Сцена, свет, камеры',   desc: 'V-Ray / Corona, экспозиция', order: 2 },
    { key: 'mat',   title: 'Материалы и текстуры',  desc: 'Шейдеры, UV, tiling', order: 3 },
    { key: 'qc',    title: 'Pre-render QC',          desc: 'Шумы, артефакты, настройки', order: 4 },
    { key: 'post',  title: 'Пост-продакшн',          desc: 'Photoshop, композ, цвет', order: 5 },
    { key: 'final', title: 'Финальная сдача',        desc: 'Форматы, метаданные, архив', order: 6 },
  ];

  // ===== SHOT 04 Lobby (Skolkovo One) =====
  const shot04 = await prisma.shot.create({
    data: {
      id: 'shot_sko_04',
      projectId: 'proj_skolkovo',
      code: 'SKO_SH04',
      title: 'Shot 04 · Lobby',
      software: '3dsmax 2024 · V-Ray 6.2',
      resolution: '3840×2160',
      status: 'WIP',
      assigneeId: 'u1',
      dueDate: new Date('2026-04-24'),
      order: 4,
    },
  });

  // Создаём главы для shot04 с реальными пунктами
  const itemsData: Record<string, { title: string; state: 'TODO' | 'WIP' | 'DONE' | 'BLOCKED'; ownerId: string; note?: string }[]> = {
    pre: [
      { title: 'Бриф согласован с арт-директором', state: 'DONE', ownerId: 'u2', note: 'v3 финал' },
      { title: 'Референсы собраны (минимум 6)', state: 'DONE', ownerId: 'u1' },
      { title: 'Планировка и блокинг сцены', state: 'DONE', ownerId: 'u1' },
      { title: 'Мудборд по настроению и времени суток', state: 'DONE', ownerId: 'u1' },
      { title: 'Технический бриф: ракурсы и финальные форматы', state: 'DONE', ownerId: 'u2' },
    ],
    mod: [
      { title: "Геометрия без n-gon'ов и невалидных нормалей", state: 'DONE', ownerId: 'u1' },
      { title: 'Все объекты названы по шаблону (pfx_item_v001)', state: 'DONE', ownerId: 'u1' },
      { title: 'UVW разложены, нет overlapping по важной геометрии', state: 'DONE', ownerId: 'u1' },
      { title: 'Масштаб в реальных единицах (см) и pivot в нуле', state: 'DONE', ownerId: 'u1' },
      { title: 'Оптимизация плотности: высокополи только в fg', state: 'WIP', ownerId: 'u1', note: 'карнизы ещё тяжёлые' },
      { title: 'Коллапс стека там, где это безопасно', state: 'TODO', ownerId: 'u1' },
      { title: 'Все прокси собраны и проверены в изоляции', state: 'TODO', ownerId: 'u3' },
    ],
    scene: [
      { title: 'Гамма 2.2 / linear workflow', state: 'DONE', ownerId: 'u1' },
      { title: 'Физическая камера: f-stop, ISO, shutter', state: 'DONE', ownerId: 'u1' },
      { title: 'HDRI для первички + Sun+Sky при необходимости', state: 'WIP', ownerId: 'u1' },
      { title: 'Bounces и GI корректны (без overbright)', state: 'WIP', ownerId: 'u1', note: 'перепроверить вторичку' },
      { title: 'Light select render elements настроены', state: 'TODO', ownerId: 'u1' },
      { title: 'Tone mapping: Reinhard / физический', state: 'TODO', ownerId: 'u1' },
      { title: 'Экспозиция и EV замерены в нескольких точках', state: 'BLOCKED', ownerId: 'u2', note: 'ждём правки от арт-дира' },
      { title: 'Камеры залочены, не едут по таймлайну', state: 'TODO', ownerId: 'u1' },
    ],
    mat: [
      { title: 'Все материалы из утверждённой библиотеки', state: 'WIP', ownerId: 'u1' },
      { title: 'Displacement: проверены subdivs и view-dependent', state: 'TODO', ownerId: 'u1' },
      { title: 'Бамп/нормали в правильном цветовом пространстве', state: 'TODO', ownerId: 'u1' },
      { title: 'Tiling без швов на заметных поверхностях', state: 'TODO', ownerId: 'u1' },
      { title: 'Прозрачные материалы: IOR и толщина', state: 'TODO', ownerId: 'u1' },
      { title: 'Reflectivity на стекле/металле откалибрована', state: 'TODO', ownerId: 'u1' },
    ],
    qc: [
      { title: 'Test-render 1080p без шумов', state: 'TODO', ownerId: 'u4' },
      { title: 'Render elements все записываются (EXR)', state: 'TODO', ownerId: 'u4' },
      { title: 'Denoiser настроен корректно', state: 'TODO', ownerId: 'u4' },
      { title: 'Нет firefly на reflections/refractions', state: 'TODO', ownerId: 'u4' },
      { title: 'Ошибок и warnings нет в render log', state: 'TODO', ownerId: 'u4' },
      { title: 'Размер и DPI соответствуют ТЗ', state: 'TODO', ownerId: 'u4' },
      { title: 'Render nodes доступны, очередь построена', state: 'TODO', ownerId: 'u4' },
      { title: 'Frame buffer clamping off', state: 'TODO', ownerId: 'u4' },
      { title: 'Сохранён .max файл + ассеты через Asset Tracking', state: 'TODO', ownerId: 'u1' },
    ],
    post: [
      { title: 'EXR собран и слои проверены', state: 'TODO', ownerId: 'u5' },
      { title: 'Цветокор: баланс, контраст, температура', state: 'TODO', ownerId: 'u5' },
      { title: 'Добавлены люди/антураж по ТЗ', state: 'TODO', ownerId: 'u5' },
      { title: 'Постэффекты: glow, бликование, зерно', state: 'TODO', ownerId: 'u5' },
      { title: 'Финальный PSD сохранён с layers', state: 'TODO', ownerId: 'u5' },
    ],
    final: [
      { title: 'Экспорт в JPG 100% + TIFF 16bit', state: 'TODO', ownerId: 'u5' },
      { title: 'Метаданные: проект, ракурс, версия', state: 'TODO', ownerId: 'u5' },
      { title: 'Превью и тумбы для презентации', state: 'TODO', ownerId: 'u5' },
      { title: 'Архив сцены на студийный NAS', state: 'TODO', ownerId: 'u2' },
    ],
  };

  let chapterCount = 0;
  let itemCount = 0;

  for (const def of chapterDefs) {
    const chapter = await prisma.chapter.create({
      data: {
        title: def.title,
        description: def.desc,
        order: def.order,
      },
    });
    chapterCount++;

    const items = itemsData[def.key] ?? [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await prisma.checkItem.create({
        data: {
          shotId: shot04.id,
          chapterId: chapter.id,
          title: item.title,
          state: item.state,
          ownerId: item.ownerId,
          note: item.note ?? null,
          order: i,
        },
      });
      itemCount++;
    }
  }
  console.log(`✓ Создано ${chapterCount} глав, ${itemCount} пунктов`);

  // ===== Ещё несколько шотов Skolkovo =====
  const otherShots = [
    { code: 'SKO_SH01', title: 'Shot 01 · Hero Exterior', status: 'REVIEW' as const, assigneeId: 'u3', order: 1 },
    { code: 'SKO_SH07', title: 'Shot 07 · Master Bedroom', status: 'TODO' as const, assigneeId: 'u1', order: 7 },
  ];

  for (const s of otherShots) {
    await prisma.shot.create({
      data: {
        projectId: 'proj_skolkovo',
        ...s,
        software: '3dsmax 2024 · V-Ray 6.2',
        resolution: '3840×2160',
        dueDate: new Date('2026-04-24'),
      },
    });
  }

  // Шоты Primavera (сданы)
  await prisma.shot.create({
    data: {
      projectId: 'proj_primavera',
      code: 'PRM_SH03',
      title: 'Shot 03 · Living Room',
      status: 'DONE',
      assigneeId: 'u1',
      software: '3dsmax 2024 · Corona 10',
      resolution: '3840×2160',
      dueDate: new Date('2026-04-12'),
      order: 3,
    },
  });

  await prisma.shot.create({
    data: {
      projectId: 'proj_primavera',
      code: 'PRM_SH05',
      title: 'Shot 05 · Bathroom',
      status: 'DONE',
      assigneeId: 'u3',
      software: '3dsmax 2024 · Corona 10',
      resolution: '3840×2160',
      dueDate: new Date('2026-04-12'),
      order: 5,
    },
  });

  // Шоты Kosmo
  await prisma.shot.create({
    data: {
      projectId: 'proj_kosmo',
      code: 'KSM_SH02',
      title: 'Shot 02 · Facade Evening',
      status: 'TODO',
      assigneeId: 'u3',
      software: '3dsmax 2024 · V-Ray 6.2',
      resolution: '5120×2880',
      dueDate: new Date('2026-04-28'),
      order: 2,
    },
  });

  // Beregovoy
  await prisma.shot.create({
    data: {
      projectId: 'proj_beregovoy',
      code: 'BGV_SH11',
      title: 'Shot 11 · Kitchen',
      status: 'WIP',
      assigneeId: 'u1',
      software: '3dsmax 2024 · V-Ray 6.2',
      resolution: '3840×2160',
      dueDate: new Date('2026-05-02'),
      order: 11,
    },
  });

  console.log(`✓ Создано 6 дополнительных шотов`);

  // ===== ВЕРСИИ РЕНДЕРОВ =====
  await prisma.renderVersion.createMany({
    data: [
      {
        shotId: shot04.id, version: 'v010', format: 'EXR',
        url: 'https://placehold.co/1920x1200/1a2a3a/ffffff?text=v010',
        thumbnailUrl: 'https://placehold.co/400x250/1a2a3a/ffffff?text=v010',
        resolution: '3840×2160', fileSize: 245_000_000,
      },
      {
        shotId: shot04.id, version: 'v011', format: 'EXR',
        url: 'https://placehold.co/1920x1200/2a3a4a/ffffff?text=v011',
        thumbnailUrl: 'https://placehold.co/400x250/2a3a4a/ffffff?text=v011',
        resolution: '3840×2160', fileSize: 248_000_000,
      },
      {
        shotId: shot04.id, version: 'v012', format: 'EXR',
        url: 'https://placehold.co/1920x1200/3a4a5a/ffffff?text=v012+%E2%80%A2+IPR',
        thumbnailUrl: 'https://placehold.co/400x250/3a4a5a/ffffff?text=v012',
        resolution: '3840×2160', fileSize: 251_000_000,
      },
    ],
  });
  console.log(`✓ Создано 3 версии рендера`);

  // ===== КОММЕНТАРИИ с ПИНАМИ =====
  const comments = await prisma.comment.createMany({
    data: [
      {
        shotId: shot04.id, userId: 'u2', body: 'Свет на задней стене переэкспонирован — снизьте HDRI multiplier на 0.7.',
        pinX: 72, pinY: 38,
      },
      {
        shotId: shot04.id, userId: 'u4', body: 'На карнизах firefly, поставьте max subdivs = 64 и noise threshold 0.01.',
        pinX: 28, pinY: 18,
      },
    ],
  });

  // Ответ на первый комментарий
  const firstComment = await prisma.comment.findFirst({ where: { userId: 'u2', shotId: shot04.id } });
  if (firstComment) {
    await prisma.comment.create({
      data: {
        shotId: shot04.id, userId: 'u1', body: 'Принято, правлю в v012. Загружу до вечера.',
        parentId: firstComment.id,
      },
    });
  }
  console.log(`✓ Создано 3 комментария с пинами`);

  // ===== АКТИВНОСТИ =====
  await prisma.activity.createMany({
    data: [
      { userId: 'u1', shotId: shot04.id, type: 'RENDER_UPLOADED', payload: { version: 'v012' } },
      { userId: 'u4', shotId: shot04.id, type: 'COMMENT_ADDED', payload: { body: 'firefly на карнизах' } },
      { userId: 'u2', shotId: shot04.id, type: 'CHECKLIST_ITEM_UPDATED', payload: { state: 'BLOCKED', item: 'Экспозиция' } },
      { userId: 'u1', shotId: shot04.id, type: 'RENDER_UPLOADED', payload: { version: 'v011' } },
      { userId: 'u2', shotId: shot04.id, type: 'CHECKLIST_ITEM_UPDATED', payload: { state: 'DONE', item: 'Моделирование' } },
      { userId: 'u3', shotId: shot04.id, type: 'COMMENT_ADDED', payload: { body: '3 референса в pre-production' } },
      { userId: 'u1', shotId: shot04.id, type: 'SHOT_STATUS_CHANGED', payload: { from: 'TODO', to: 'WIP' } },
      { userId: 'u2', type: 'SHOT_CREATED', payload: { title: 'Shot 04 · Lobby' } },
    ],
  });
  console.log(`✓ Создано 8 записей активности`);

  // ===== ШАБЛОНЫ ЧЕКЛИСТОВ =====
  const fullTemplate = await prisma.checklistTemplate.create({
    data: {
      title: 'Стандартный интерьер V-Ray',
      description: 'Полный чеклист для интерьерных рендеров в V-Ray. Охватывает все 7 этапов.',
      tags: ['interior', 'v-ray', 'full'],
      usedCount: 14,
    },
  });

  await prisma.templateItem.createMany({
    data: [
      { templateId: fullTemplate.id, chapterKey: 'pre', title: 'Бриф согласован с арт-директором', order: 0 },
      { templateId: fullTemplate.id, chapterKey: 'pre', title: 'Референсы собраны (минимум 6)', order: 1 },
      { templateId: fullTemplate.id, chapterKey: 'mod', title: "Геометрия без n-gon'ов", order: 0 },
      { templateId: fullTemplate.id, chapterKey: 'mod', title: 'UVW разложены', order: 1 },
      { templateId: fullTemplate.id, chapterKey: 'qc', title: 'Test-render 1080p без шумов', order: 0 },
    ],
  });

  await prisma.checklistTemplate.create({
    data: {
      title: 'Быстрый QC',
      description: 'Минимальный чеклист перед отправкой на ревью.',
      tags: ['qc', 'quick'],
      usedCount: 8,
    },
  });

  await prisma.checklistTemplate.create({
    data: {
      title: 'Экстерьер Corona',
      description: 'Чеклист для экстерьерных рендеров в Corona Renderer.',
      tags: ['exterior', 'corona'],
      usedCount: 5,
    },
  });

  console.log(`✓ Создано 3 шаблона чек-листов`);
  console.log('\n✅ Сидирование завершено успешно!');
}

main()
  .catch((e) => {
    console.error('Ошибка при сидировании:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
