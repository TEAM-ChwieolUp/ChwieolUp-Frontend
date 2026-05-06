import { Suspense } from 'react';
import SettingsPage from '@/components/etc/settings-page/SettingsPage';

export default function MorePage() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
