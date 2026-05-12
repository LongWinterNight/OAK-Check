import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

const LoginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

// Dev-аккаунт — только в development, credentials из .env.local
const DEV_USER = process.env.NODE_ENV !== 'production' && process.env.DEV_USER_LOGIN
  ? {
      id: 'dev-safan',
      name: process.env.DEV_USER_NAME ?? 'Dev',
      email: process.env.DEV_USER_LOGIN,
      role: 'ADMIN' as const,
      identifier: process.env.DEV_USER_LOGIN,
      password: process.env.DEV_USER_PASSWORD ?? '',
    }
  : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Логин или Email', type: 'text' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { identifier, password } = parsed.data;

        // Dev-аккаунт — upsert в БД чтобы FK constraints работали
        if (DEV_USER && identifier === DEV_USER.identifier && password === DEV_USER.password) {
          const { prisma } = await import('@/lib/prisma');
          await prisma.user.upsert({
            where: { id: DEV_USER.id },
            create: { id: DEV_USER.id, email: DEV_USER.email, name: DEV_USER.name, role: 'ADMIN' },
            update: {},
          });
          return { id: DEV_USER.id, name: DEV_USER.name, email: DEV_USER.email, role: DEV_USER.role };
        }

        // Аккаунты из БД — ищем по email ИЛИ username (регистр игнорим)
        try {
          const { prisma } = await import('@/lib/prisma');
          const { default: bcrypt } = await import('bcryptjs');

          const id = identifier.trim().toLowerCase();
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: { equals: id, mode: 'insensitive' } },
                { username: { equals: id, mode: 'insensitive' } },
              ],
            },
          });
          if (!user?.passwordHash) return null;

          // Проверка блокировки
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            return null; // заблокирован — вернём null, UI покажет общее сообщение
          }

          const valid = await bcrypt.compare(password, user.passwordHash);

          if (!valid) {
            const attempts = user.loginAttempts + 1;
            const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
            await prisma.user.update({
              where: { id: user.id },
              data: { loginAttempts: attempts, ...(lockUntil ? { lockedUntil: lockUntil } : {}) },
            });
            return null;
          }

          // Успешный вход — сброс счётчика и отметка «онлайн»
          await prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), online: true },
          });

          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      // На логине — кладём данные из user в токен
      if (user) {
        token.id = user.id ?? '';
        token.role = ((user as Record<string, unknown>).role as string) ?? 'ARTIST';
        return token;
      }

      // Перечитываем роль из БД ТОЛЬКО когда клиент явно дёрнул update().
      // На клиенте это делает useUserChannel, реагируя на SSE-событие
      // user:role-changed. Так мы получаем мгновенный refresh при смене роли
      // и не бьём БД на каждом декоде токена (что переполняло пул коннектов
      // при параллельных auth() из админ-страницы / heartbeat / SSE-роутов).
      if (trigger !== 'update') return token;

      const tokenId = token.id;
      if (typeof tokenId !== 'string' || !tokenId || tokenId === 'dev-safan') {
        return token;
      }

      try {
        const { prisma } = await import('@/lib/prisma');
        const fresh = await prisma.user.findUnique({
          where: { id: tokenId },
          select: { role: true },
        });
        if (fresh) token.role = fresh.role;
      } catch {
        // БД временно недоступна — не разлогиниваем, оставляем прошлую роль
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = (token.id as string) ?? '';
      session.user.role = (token.role as import('@/lib/roles').Role) ?? 'ARTIST';
      return session;
    },
  },

  events: {
    async signOut(message) {
      // При выходе — снимаем флаг «онлайн»
      try {
        const userId =
          'token' in message && message.token
            ? (message.token.id as string | undefined)
            : 'session' in message && message.session && 'userId' in message.session
              ? (message.session.userId as string | undefined)
              : undefined;
        if (userId && userId !== 'dev-safan') {
          const { prisma } = await import('@/lib/prisma');
          await prisma.user.update({ where: { id: userId }, data: { online: false } });
        }
      } catch {
        // не падать — это вспомогательное действие
      }
    },
  },
});
