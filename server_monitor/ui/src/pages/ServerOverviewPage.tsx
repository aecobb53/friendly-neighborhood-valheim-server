import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui';

export default function ServerOverviewPage() {
  const { name } = useParams<{ name: string }>();

  return (
    <div>
      <PageHeader
        title={name ?? 'Server'}
        subtitle="Server overview coming in Phase 2."
      />
    </div>
  );
}
