import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './FeaturedCarousel.module.css';

export interface CarouselSlide {
  id: string;
  image?: string;
  alt: string;
  title?: string;
  subtitle?: string;
  href?: string;
}

interface FeaturedCarouselProps {
  slides: CarouselSlide[];
  autoRotate?: boolean;
  interval?: number;
  showIndicators?: boolean;
  showNavigation?: boolean;
}

export default function FeaturedCarousel({
  slides,
  autoRotate = true,
  interval = 5000,
  showIndicators = true,
  showNavigation = true,
}: FeaturedCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!autoRotate || paused || slides.length <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRotate, paused, interval, next, slides.length]);

  if (!slides.length) return null;

  const slide = slides[active];

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className={styles.track} style={{ transform: `translateX(-${active * 100}%)` }}>
        {slides.map((s) => (
          <div
            key={s.id}
            className={styles.slide}
            style={s.image ? { backgroundImage: `url(${s.image})` } : undefined}
            aria-label={s.alt}
          >
            {!s.image && <div className={styles.placeholder} />}
          </div>
        ))}
      </div>

      {/* Text overlay */}
      {(slide.title || slide.subtitle) && (
        <div className={styles.overlay}>
          {slide.title && <h2 className={styles.title}>{slide.title}</h2>}
          {slide.subtitle && <p className={styles.subtitle}>{slide.subtitle}</p>}
        </div>
      )}

      {/* Previous / Next */}
      {showNavigation && slides.length > 1 && (
        <>
          <button
            className={[styles.navBtn, styles.navPrev].join(' ')}
            onClick={prev}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className={[styles.navBtn, styles.navNext].join(' ')}
            onClick={next}
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showIndicators && slides.length > 1 && (
        <div className={styles.indicators} aria-label="Slide indicators">
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={[styles.dot, i === active ? styles.dotActive : ''].join(' ')}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
