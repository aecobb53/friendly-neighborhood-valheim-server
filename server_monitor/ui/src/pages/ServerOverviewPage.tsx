import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function ServerOverviewPage() {
  const { name } = useParams<{ name: string }>();
  usePageTitle(name);

  return (
    <div>
      <PageHeader
        title={name ?? 'Server'}
        subtitle="Server overview coming in Phase 2."
      />
    </div>
  );
}
