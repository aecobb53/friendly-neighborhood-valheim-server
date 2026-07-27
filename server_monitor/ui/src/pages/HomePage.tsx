import { useNavigate } from 'react-router-dom';
import { FeaturedCarousel, Card } from '@/components/ui';
import type { CarouselSlide } from '@/components/ui/FeaturedCarousel';
import styles from './HomePage.module.css';

// Placeholder slides — replaced when the backend provides media
const SLIDES: CarouselSlide[] = [
  {
    id: 'placeholder-1',
    alt: 'Community screenshot',
    title: 'Welcome to the Server Hub',
    subtitle: 'Your home for community events, servers, and shared adventures.',
  },
  {
    id: 'placeholder-2',
    alt: 'Community screenshot 2',
    title: 'Something epic is always happening',
    subtitle: "Check the events page to see what's coming up.",
  },
];

// Placeholder news items — replaced when the backend provides a feed endpoint
const WHATS_NEW = [
  { id: '1', text: '🗺 New server world started — jump in and explore.' },
  { id: '2', text: '⚔ Boss fight night is coming — check the Events page.' },
  { id: '3', text: '📸 Gallery updated with fresh community screenshots.' },
];

const NAV_CARDS = [
  { to: '/events',  label: 'Events',  icon: '📅', description: 'Upcoming battles, raids, and community nights.' },
  { to: '/gallery', label: 'Gallery', icon: '🖼', description: 'Screenshots and highlights from the community.' },
  { to: '/tasks',   label: 'Tasks',   icon: '📋', description: 'Community goals and shared to-do lists.' },
  { to: '/servers', label: 'Servers', icon: '⚔', description: 'View all game servers and their current status.' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.root}>

      {/* Featured Carousel */}
      <section className={styles.carouselSection}>
        <FeaturedCarousel slides={SLIDES} />
      </section>

      {/* Welcome */}
      <section className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>Welcome back</h1>
        <p className={styles.welcomeText}>
          Stay up to date with events, projects, screenshots, and everything
          happening across our game servers.
        </p>
      </section>

      {/* What's New */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What's New</h2>
        <ul className={styles.newsList}>
          {WHATS_NEW.map((item) => (
            <li key={item.id} className={styles.newsItem}>
              {item.text}
            </li>
          ))}
        </ul>
      </section>

      {/* Navigation Cards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Explore</h2>
        <div className={styles.navGrid}>
          {NAV_CARDS.map(({ to, label, icon, description }) => (
            <Card
              key={to}
              interactive
              className={styles.navCard}
              onClick={() => navigate(to)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(to);
                }
              }}
              aria-label={`Go to ${label}`}
            >
              <span className={styles.navIcon}>{icon}</span>
              <h3 className={styles.navLabel}>{label}</h3>
              <p className={styles.navDescription}>{description}</p>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
