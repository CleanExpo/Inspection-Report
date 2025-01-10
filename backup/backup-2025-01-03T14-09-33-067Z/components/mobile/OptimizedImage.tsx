import React from 'react';
import { useLazyImage } from '../../utils/mobilePerformance';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallback?: string;
  blur?: boolean;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  containerClassName?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallback = '/images/placeholder.png',
  blur = true,
  quality,
  format,
  alt = '',
  containerClassName = '',
  className = '',
  ...props
}) => {
  const { imageRef, imageSrc, isLoaded, handleLoad } = useLazyImage(src, {
    rootMargin: '50px',
    threshold: 0.1,
  });

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Placeholder/Blur */}
      {!isLoaded && blur && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ backdropFilter: 'blur(10px)' }}
        />
      )}

      {/* Main Image */}
      <img
        ref={imageRef}
        src={imageSrc || fallback}
        alt={alt}
        onLoad={handleLoad}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
        {...props}
      />

      {/* Loading Indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

interface OptimizedImageGridProps {
  images: Array<{
    src: string;
    alt?: string;
  }>;
  columnCount?: number;
  gap?: number;
  className?: string;
}

export const OptimizedImageGrid: React.FC<OptimizedImageGridProps> = ({
  images,
  columnCount = 2,
  gap = 4,
  className = '',
}) => {
  return (
    <div 
      className={`grid gap-${gap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt || ''}
          containerClassName="aspect-square"
        />
      ))}
    </div>
  );
};

interface OptimizedBackgroundImageProps {
  src: string;
  fallback?: string;
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export const OptimizedBackgroundImage: React.FC<OptimizedBackgroundImageProps> = ({
  src,
  fallback = '/images/placeholder.png',
  children,
  className = '',
  overlayClassName = '',
}) => {
  const { imageRef, imageSrc, isLoaded } = useLazyImage(src, {
    rootMargin: '100px',
    threshold: 0,
  });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Image */}
      <div
        ref={imageRef}
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url(${imageSrc || fallback})`,
          opacity: isLoaded ? 1 : 0,
        }}
      />

      {/* Optional Overlay */}
      {overlayClassName && (
        <div className={`absolute inset-0 ${overlayClassName}`} />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
