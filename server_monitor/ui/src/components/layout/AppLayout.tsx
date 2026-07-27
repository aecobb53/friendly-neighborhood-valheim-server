import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { CommunityFeed } from '@/components/ui';
import styles from './AppLayout.module.css';

// TODO: replace with GET /api/feed once the backend endpoint exists
const PLACEHOLDER_MESSAGES = [
  '⚔ Welcome to the community server hub',
  '💡 Repair your gear before sailing',
  '🎉 More features coming soon',
];

export default function AppLayout() {
  return (
    <div className={styles.root}>
      <Navbar />
      <CommunityFeed messages={PLACEHOLDER_MESSAGES} />

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
