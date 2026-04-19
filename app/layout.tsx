import type { Metadata } from 'next';
import ThemeProvider from '@/components/layout/ThemeProvider/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'OAK·Check — Студия OAK3D',
  description: 'Система управления производственными чек-листами для 3D-студии OAK3D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
