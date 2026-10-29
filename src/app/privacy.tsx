import { useRouter } from 'expo-router';

import { PrivacyScreen } from '@/features/privacy';
import { deviceSupportLink, supportIssuesUrl } from '@/services/support-link';

export default function PrivacyRoute(): React.JSX.Element {
  const router = useRouter();

  return (
    <PrivacyScreen
      onBack={() => router.back()}
      supportUrl={supportIssuesUrl}
      onSupport={() => {
        void deviceSupportLink.open().catch(() => undefined);
      }}
    />
  );
}
