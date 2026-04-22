import { auth } from '@/auth';
import { BottomNavWithUpload } from './BottomNavWithUpload';

export default async function BottomNav() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? 'ARTIST';

  return <BottomNavWithUpload role={role} />;
}
