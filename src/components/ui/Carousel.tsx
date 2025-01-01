import React, { useState, useEffect, useCallback } from 'react';
import { BaseProps } from '../../types/ui';

interface CarouselProps extends BaseProps {
  /**
   * Whether to show navigation arrows
   */
  arrows?: boolean;

  /**
   * Whether to show navigation dots
   */
  dots?: boolean;

  /**
   * Whether to enable infinite scrolling
   */
  infinite?: boolean;

  /**
   * Whether to enable autoplay
   */
  autoplay?: boolean;

  /**
   * Autoplay interval in milliseconds
   */
  autoplayInterval?: number;

  /**
   * Whether to pause autoplay on hover
   */
  pauseOnHover?: boolean;

  /**
   * The animation duration in milliseconds
   */
  duration?: number;

  /**
   * The initial slide index
   */
  initialSlide?: number;

  /**
   * Whether to show slide counter
   */
  counter?: boolean;

  /**
   * Whether to enable touch/swipe navigation
   */
  swipeable?: boolean;

  /**
   * Callback when slide changes
   */
  onChange?: (index: number) => void;
}

interface CarouselItemProps extends BaseProps {
  /**
   * Whether the item is currently active
   */
  active?: boolean;
}

interface CarouselComposition {
  Item: React.FC<CarouselItemProps>;
}

const Carousel: React.FC<CarouselProps> & CarouselComposition = ({
  children,
  arrows = true,
  dots = true,
  infinite = true,
  autoplay = false,
  autoplayInterval = 3000,
  pauseOnHover = true,
  duration = 300,
  initialSlide = 0,
  counter = false,
  swipeable = true,
  onChange,
  className = '',
  ...props
}) => {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;

  const goToSlide = useCallback((index: number) => {
    let newIndex = index;

    if (infinite) {
      if (index < 0) {
        newIndex = totalSlides - 1;
      } else if (index >= totalSlides) {
        newIndex = 0;
      }
    } else {
      if (index < 0) {
        newIndex = 0;
      } else if (index >= totalSlides) {
        newIndex = totalSlides - 1;
      }
    }

    setCurrentSlide(newIndex);
    onChange?.(newIndex);
  }, [totalSlides, infinite, onChange]);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoplay && !isPaused) {
      interval = setInterval(() => {
        nextSlide();
      }, autoplayInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoplay, autoplayInterval, isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!swipeable) return;

    const difference = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(difference) > minSwipeDistance) {
      if (difference > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
          transitionDuration: `${duration}ms`,
        }}
      >
        {slides.map((slide, index) => (
          React.cloneElement(slide as React.ReactElement, {
            key: index,
            active: index === currentSlide,
          })
        ))}
      </div>

      {/* Navigation arrows */}
      {arrows && (
        <>
          <button
            onClick={prevSlide}
            disabled={!infinite && currentSlide === 0}
            className={`
              absolute left-4 top-1/2 -translate-y-1/2
              p-2 rounded-full bg-white/80 shadow-md
              text-gray-800 hover:bg-white
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-primary-500
              transition-all
            `}
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            disabled={!infinite && currentSlide === totalSlides - 1}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2
              p-2 rounded-full bg-white/80 shadow-md
              text-gray-800 hover:bg-white
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-primary-500
              transition-all
            `}
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Navigation dots */}
      {dots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-2 h-2 rounded-full
                transition-all
                focus:outline-none focus:ring-2 focus:ring-primary-500
                ${index === currentSlide
                  ? 'bg-white w-4'
                  : 'bg-white/50 hover:bg-white/80'
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {counter && (
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {currentSlide + 1} / {totalSlides}
        </div>
      )}
    </div>
  );
};

const CarouselItem: React.FC<CarouselItemProps> = ({
  children,
  active,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        flex-shrink-0 w-full
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

Carousel.Item = CarouselItem;

export default Carousel;

/**
 * Carousel Component Usage Guide:
 * 
 * 1. Basic carousel:
 *    <Carousel>
 *      <Carousel.Item>Slide 1</Carousel.Item>
 *      <Carousel.Item>Slide 2</Carousel.Item>
 *      <Carousel.Item>Slide 3</Carousel.Item>
 *    </Carousel>
 * 
 * 2. Without arrows:
 *    <Carousel arrows={false}>
 *      <Carousel.Item>Slide 1</Carousel.Item>
 *      <Carousel.Item>Slide 2</Carousel.Item>
 *    </Carousel>
 * 
 * 3. Without dots:
 *    <Carousel dots={false}>
 *      <Carousel.Item>Slide 1</Carousel.Item>
 *      <Carousel.Item>Slide 2</Carousel.Item>
 *    </Carousel>
 * 
 * 4. With autoplay:
 *    <Carousel
 *      autoplay
 *      autoplayInterval={5000}
 *    >
 *      <Carousel.Item>Slide 1</Carousel.Item>
 *      <Carousel.Item>Slide 2</Carousel.Item>
 *    </Carousel>
 * 
 * 5. Without infinite scrolling:
 *    <Carousel infinite={false}>
 *      <Carousel.Item>Slide 1</Carousel.Item>
 *      <Carousel.Item>Slide 2</Carousel.Item>
 *    </Carousel>
 * 
 * 6. With counter:
 *    <Carousel counter>
 *      <Carousel.Item>Slide 1</Carousel.Item>
 *      <Carousel.Item>Slide 2</Carousel.Item>
 *    </Carousel>
 * 
 * 7. Without swipe:
 *    <Carousel swipeable={false}>
 *      <Carousel.Item>Slide 1</Carousel.Item>
 *      <Carousel.Item>Slide 2</Carousel.Item>
 *    </Carousel>
 * 
 * 8. With custom duration:
 *    <Carousel duration={500}>
 *      <Carousel.Item>Slide 1</Carousel.Item>
 *      <Carousel.Item>Slide 2</Carousel.Item>
 *    </Carousel>
 * 
 * 9. With onChange callback:
 *    <Carousel
 *      onChange={(index) => console.log(`Current slide: ${index}`)}
 *    >
 *      <Carousel.Item>Slide 1</Carousel.Item>
 *      <Carousel.Item>Slide 2</Carousel.Item>
 *    </Carousel>
 * 
 * Notes:
 * - Navigation arrows
 * - Navigation dots
 * - Infinite scrolling
 * - Autoplay support
 * - Touch/swipe support
 * - Slide counter
 * - Custom animations
 * - Change callbacks
 * - Accessible
 */
