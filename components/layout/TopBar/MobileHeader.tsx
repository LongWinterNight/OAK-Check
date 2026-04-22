import { auth } from '@/auth';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import Avatar from '@/components/ui/Avatar/Avatar';
import styles from './TopBar.module.css';

export async function MobileHeader() {
  const session = await auth();
  const user = session?.user;
  const name = user?.name ?? 'User';
  const avatarUrl = (user as { avatarUrl?: string | null })?.avatarUrl ?? null;

  return (
    <div className={styles.mobileBar}>
      <div className={styles.mobileLogo}>
        <Icons.Oak size={16} color="var(--oak)" />
        <span className={styles.mobileLogoText}>OAK·Check</span>
      </div>
      <Link href="/settings" className={styles.mobileAvatar} aria-label="Профиль">
        <Avatar name={name} src={avatarUrl} size={32} />
      </Link>
    </div>
  );
}
