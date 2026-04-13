import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/layout/dashboard-shell/DashboardShell';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('chwieolup_auth')?.value === '1';

  if (!isLoggedIn) {
    redirect('/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
