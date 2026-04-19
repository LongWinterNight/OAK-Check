import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
