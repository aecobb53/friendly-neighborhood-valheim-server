import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '@/api/client';
import { Card, ErrorState, FeaturedCarousel, LoadingState, PageHeader, StatusBadge } from '@/components/ui';
import type { CarouselSlide } from '@/components/ui/FeaturedCarousel';
import type { ServerInfo } from '@/types/server';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from './ServerOverviewPage.module.css';

type CarouselApiItem =
  | string
  | {
      id?: string;
      image?: string;
      alt?: string;
      title?: string;
      subtitle?: string;
      href?: string;
    };

function mapCarouselItems(items: CarouselApiItem[]): CarouselSlide[] {
  return items
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: `slide-${index}`,
          alt: item,
          title: item,
        };
      }

      return {
        id: item.id ?? `slide-${index}`,
        image: item.image,
        alt: item.alt ?? item.title ?? `Slide ${index + 1}`,
        title: item.title,
        subtitle: item.subtitle,
        href: item.href,
      };
    })
    .filter((slide) => Boolean(slide.alt));
}

export default function ServerOverviewPage() {
  const { name } = useParams<{ name: string }>();
  const location = useLocation();
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(server?.display_name ?? name ?? 'Server');

  useEffect(() => {
    let cancelled = false;

    async function loadServer() {
      if (!name) {
        if (!cancelled) {
          setError('No server was selected.');
          setLoading(false);
        }
        return;
      }

      const response = await api.get<ServerInfo>(`/server-info/${encodeURIComponent(name)}`);

      if (cancelled) {
        return;
      }

      if (response.success) {
        setServer(response.data);
        setError(null);
      } else {
        setError(response.error.message);
      }

      setLoading(false);
    }

    loadServer();

    return () => {
      cancelled = true;
    };
  }, [name]);

  useEffect(() => {
    let cancelled = false;

    async function loadCarousel() {
      const page = encodeURIComponent(location.pathname || '/');
      const response = await api.get<CarouselApiItem[]>(`/carousel?page=${page}`);

      if (!cancelled && response.success && Array.isArray(response.data)) {
        const mapped = mapCarouselItems(response.data);
        if (mapped.length) {
          setSlides(mapped);
        } else {
          setSlides([]);
        }
      }
    }

    loadCarousel();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const latestStatus = server?.server_status_list[0];
  const recentNews = server?.server_status_list.slice(0, 3) ?? [];
  const quickLinks = useMemo(() => {
    if (!server) {
      return [];
    }

    const serverFilter = `server=${encodeURIComponent(server.server_name)}`;

    return [
      { label: 'Events', to: `/events?${serverFilter}` },
      { label: 'Gallery', to: `/gallery?${serverFilter}` },
      { label: 'Requests', to: `/requests?${serverFilter}` },
    ];
  }, [server]);

  if (loading) {
    return <LoadingState message="Loading server overview…" />;
  }

  if (error || !server) {
    return <ErrorState message={error ?? 'Unable to load server overview.'} />;
  }

  return (
    <div className={styles.root}>
      {slides.length > 0 && (
        <section className={styles.hero}>
          <FeaturedCarousel slides={slides} />
        </section>
      )}

      <PageHeader
        title={server.display_name}
        subtitle={server.description}
      />

      <div className={styles.content}>
        <div className={styles.column}>
          <Card className={styles.summary}>
            <div className={styles.summaryRow}>
              <div>
                <p className={styles.label}>Game</p>
                <p className={styles.value}>{server.game}</p>
              </div>
              <div>
                <p className={styles.label}>Container</p>
                <p className={styles.value}>{server.container_status}</p>
              </div>
              <div>
                <p className={styles.label}>Display Status</p>
                <StatusBadge status={server.display_status} />
              </div>
              <div>
                <p className={styles.label}>Updated</p>
                <p className={styles.value}>{server.timestamp}</p>
              </div>
            </div>

            <div className={styles.summaryNote}>
              <p className={styles.label}>Latest Update</p>
              <p className={styles.value}>{latestStatus?.message ?? 'No recent updates have been recorded yet.'}</p>
            </div>
          </Card>

          <Card className={styles.section}>
            <h2 className={styles.sectionTitle}>Quick Links</h2>
            <div className={styles.linkGrid}>
              {quickLinks.map((link) => (
                <Link key={link.label} to={link.to} className={styles.linkCard}>
                  {link.label}
                </Link>
              ))}
            </div>
          </Card>

          <Card className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent News</h2>
            <div className={styles.historyList}>
              {recentNews.map((entry) => (
                <div key={`${entry.timestamp}-${entry.status}`} className={styles.historyItem}>
                  <div>
                    <StatusBadge status={entry.status} />
                    <p className={styles.historyMessage}>{entry.message}</p>
                  </div>
                  <time className={styles.historyTime}>{entry.timestamp}</time>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className={styles.column}>
          <Card className={styles.section}>
            <h2 className={styles.sectionTitle}>Rules</h2>
            <ul className={styles.list}>
              <li>Be kind and respectful to everyone in the community.</li>
              <li>Keep builds and events welcoming for new players.</li>
              <li>Share updates in the server channel so others can follow along.</li>
            </ul>
          </Card>

          <Card className={styles.section}>
            <details className={styles.details}>
              <summary className={styles.detailsSummary}>Server Logs</summary>
              <div className={styles.logList}>
                {server.server_status_list.map((entry) => (
                  <div key={`${entry.timestamp}-${entry.status}`} className={styles.logEntry}>
                    <span className={styles.logTime}>{entry.timestamp}</span>
                    <span className={styles.logBody}>{entry.message}</span>
                  </div>
                ))}
              </div>
            </details>
          </Card>
        </div>
      </div>
    </div>
  );
}
