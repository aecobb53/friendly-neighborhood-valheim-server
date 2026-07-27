import { useMemo } from 'react';
import styles from './CommunityFeed.module.css';

interface CommunityFeedProps {
  messages: string[];
}

export default function CommunityFeed({ messages }: CommunityFeedProps) {
  // Join messages with separator as specified in community_feed.md
  const text = useMemo(
    () => messages.join(' | '),
    [messages],
  );

  if (!messages.length) return null;

  return (
    <div className={styles.feed} aria-label="Community feed">
      <div className={styles.track}>
        {/* Duplicated for seamless loop */}
        <span className={styles.content} aria-hidden="true">{text}</span>
        <span className={styles.content}>{text}</span>
      </div>
    </div>
  );
}
