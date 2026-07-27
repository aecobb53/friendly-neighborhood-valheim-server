import type { ServerStatus } from '@/types/server';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: string;
}

function normalise(raw: string): ServerStatus {
  const upper = raw.toUpperCase();
  const valid: ServerStatus[] = ['ONLINE', 'OFFLINE', 'UPDATING', 'RESTARTING', 'ERROR'];
  return valid.includes(upper as ServerStatus) ? (upper as ServerStatus) : 'UNKNOWN';
}

const LABELS: Record<ServerStatus, string> = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  UPDATING: 'Updating',
  RESTARTING: 'Restarting',
  ERROR: 'Error',
  UNKNOWN: 'Unknown',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalised = normalise(status);
  return (
    <span className={[styles.badge, styles[normalised.toLowerCase()]].join(' ')}>
      <span className={styles.dot} aria-hidden="true" />
      {LABELS[normalised]}
    </span>
  );
}
