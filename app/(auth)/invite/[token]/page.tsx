import { notFound } from 'next/navigation';
import { InviteForm } from '@/components/auth/InviteForm';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/auth/invite/${token}`, { cache: 'no-store' });

  if (res.status === 404) notFound();

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: 12,
        background: 'var(--bg)', color: 'var(--fg)',
      }}>
        <div style={{ fontSize: 48 }}>⛔</div>
        <h2 style={{ margin: 0 }}>{data.error ?? 'Недействительное приглашение'}</h2>
        <a href="/login" style={{ color: 'var(--accent)', fontSize: 14 }}>Войти в систему</a>
      </div>
    );
  }

  const { email, role } = await res.json();

  return <InviteForm token={token} email={email} role={role} />;
}
