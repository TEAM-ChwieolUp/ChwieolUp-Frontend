import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginPage from './LoginPage';

export default async function LoginRoute() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('chwieolup_auth')?.value === '1';

  if (isLoggedIn) {
    redirect('/');
  }

  return <LoginPage />;
}
