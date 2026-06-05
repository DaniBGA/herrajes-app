import React, { useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '../lib/apiClient';

export default function ProductImageCarousel({
  images = [],
  title,
  className,
  fallback,
  onOpenImage
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const safeImages = images.filter(Boolean);

  useEffect(() => {
    setCurrentIndex(0);
  }, [safeImages.length]);

  const goToPrevious = (event) => {
    event.stopPropagation();
    setCurrentIndex((value) => (value - 1 + safeImages.length) % safeImages.length);
  };

  const goToNext = (event) => {
    event.stopPropagation();
    setCurrentIndex((value) => (value + 1) % safeImages.length);
  };

  const handleTouchStart = (event) => {
    touchStartXRef.current = event.changedTouches[0].screenX;
  };

  const handleTouchEnd = (event) => {
    touchEndXRef.current = event.changedTouches[0].screenX;
    const delta = touchStartXRef.current - touchEndXRef.current;

    if (Math.abs(delta) > 30 && safeImages.length > 1) {
      if (delta > 0) {
        setCurrentIndex((value) => (value + 1) % safeImages.length);
      } else {
        setCurrentIndex((value) => (value - 1 + safeImages.length) % safeImages.length);
      }
    }
  };

  const hasMultipleImages = safeImages.length > 1;
  const currentImage = safeImages[currentIndex] || safeImages[0];

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => onOpenImage?.(currentIndex)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenImage?.(currentIndex);
        }
      }}
    >
      {safeImages.length > 0 ? (
        <img src={resolveMediaUrl(currentImage.url)} alt={currentImage.alt || title} />
      ) : (
        fallback || null
      )}

      {hasMultipleImages && (
        <>
          <button type="button" className="product-media-arrow product-media-arrow-prev" onClick={goToPrevious} aria-label="Ver imagen anterior">
            ‹
          </button>
          <button type="button" className="product-media-arrow product-media-arrow-next" onClick={goToNext} aria-label="Ver imagen siguiente">
            ›
          </button>
          <span className="product-media-counter">{currentIndex + 1}/{safeImages.length}</span>
        </>
      )}
    </div>
  );
}
