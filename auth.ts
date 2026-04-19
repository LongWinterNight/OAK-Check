import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

const LoginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

// Встроенный аккаунт для тестирования (работает без БД)
const DEV_USER = {
  id: 'dev-safan',
  name: 'Safan',
  email: 'safanch6230i',
  role: 'ADMIN',
  identifier: 'safanch6230i',
  password: 'Safanch_6230i',
};

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

        // Dev-аккаунт (без БД)
        if (identifier === DEV_USER.identifier && password === DEV_USER.password) {
          return {
            id: DEV_USER.id,
            name: DEV_USER.name,
            email: DEV_USER.email,
            role: DEV_USER.role,
          };
        }

        // Аккаунты из БД
        try {
          const { prisma } = await import('@/lib/prisma');
          const { default: bcrypt } = await import('bcryptjs');

          const user = await prisma.user.findUnique({
            where: { email: identifier },
          });

          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'ARTIST';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
