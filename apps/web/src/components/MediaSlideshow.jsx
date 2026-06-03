import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getMediaType = (src = '') => {
  const normalized = src.toLowerCase();
  if (normalized.endsWith('.mp4') || normalized.endsWith('.mov') || normalized.endsWith('.webm')) {
    return 'video';
  }
  return 'image';
};

const getVideoWindowMs = (slide) => {
  const startAt = Number(slide?.startAt ?? 0);
  const endAt = Number(slide?.endAt ?? 0);

  if (endAt > startAt) {
    return Math.max(3000, (endAt - startAt) * 1000);
  }

  return 8000;
};

const getVideoSrc = (slide) => {
  if (!slide?.src) {
    return '';
  }

  const startAt = Number(slide?.startAt ?? 0);
  const endAt = Number(slide?.endAt ?? 0);

  if (endAt > startAt) {
    return `${slide.src}#t=${startAt},${endAt}`;
  }

  if (startAt > 0) {
    return `${slide.src}#t=${startAt}`;
  }

  return slide.src;
};

const MediaSlideshow = ({
  items,
  className = '',
  overlayClassName = '',
  showDots = true,
  autoPlay = true,
  imageLoading = 'lazy',
  imageFetchPriority = 'auto',
  activateWhenInView = false,
  inViewMargin = '240px',
}) => {
  const slides = useMemo(() => items.filter(Boolean), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(!activateWhenInView);
  const containerRef = useRef(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (!activateWhenInView) {
      setIsInView(true);
      return undefined;
    }

    const node = containerRef.current;

    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: inViewMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [activateWhenInView, inViewMargin]);

  useEffect(() => {
    if (!autoPlay || !isInView || slides.length <= 1) {
      return undefined;
    }

    const activeSlide = slides[activeIndex];
    const timeoutMs = getMediaType(activeSlide?.src) === 'video' ? getVideoWindowMs(activeSlide) : 5000;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, timeoutMs);

    return () => window.clearTimeout(timer);
  }, [activeIndex, autoPlay, slides]);

  if (!slides.length) {
    return null;
  }

  const activeSlide = slides[activeIndex];
  const mediaType = getMediaType(activeSlide.src);

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {isInView && mediaType === 'video' ? (
        <video
          key={activeSlide.src}
          src={getVideoSrc(activeSlide)}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={activeSlide.poster}
        />
      ) : (
        <img
          key={activeSlide.src}
          src={activeSlide.poster || activeSlide.src}
          alt={activeSlide.alt}
          className="h-full w-full object-cover"
          loading={imageLoading}
          decoding="async"
          fetchPriority={imageFetchPriority}
        />
      )}

      {overlayClassName ? <div className={`absolute inset-0 ${overlayClassName}`}></div> : null}

      {slides.length > 1 ? (
        <>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border-white/40 bg-black/35 text-white hover:bg-black/55"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border-white/40 bg-black/35 text-white hover:bg-black/55"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      ) : null}

      {showDots && slides.length > 1 ? (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm">
          {slides.map((slide, index) => (
            <button
              key={`${slide.src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                index === activeIndex ? 'bg-white' : 'bg-white/45'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default MediaSlideshow;
