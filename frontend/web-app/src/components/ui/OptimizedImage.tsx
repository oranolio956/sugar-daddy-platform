import Image from 'next/image';
import { useState, useEffect } from 'react';

/**
 * Optimized Image component with lazy loading and responsive sizing
 */
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '100vw',
  quality = 75,
  loading = 'lazy',
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive srcSet for better performance
  const generateSrcSet = (src: string) => {
    if (!width || !height) return undefined;
    
    const formats = [0.5, 1, 1.5, 2, 3];
    return formats
      .map(scale => {
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        return `${src}?w=${w}&h=${h}&q=${quality} ${scale}x`;
      })
      .join(', ');
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        quality={quality}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          filter: isLoaded ? 'none' : 'blur(5px)',
        }}
      />
      {!isLoaded && !priority && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  );
};

/**
 * Avatar component with optimized loading
 */
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  fallback?: string;
}

export const Avatar = ({ 
  src, 
  alt = 'User avatar', 
  size = 40, 
  className = '',
  fallback 
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (src && !imageError) {
    return (
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        priority={false}
        loading="lazy"
        onError={handleImageError}
      />
    );
  }

  // Fallback avatar
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm ${className}`}
      style={{ width: size, height: size }}
    >
      {fallback || (alt.charAt(0).toUpperCase())}
    </div>
  );
};

/**
 * Background image component with optimization
 */
interface BackgroundImageProps {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

export const BackgroundImage = ({
  src,
  alt = '',
  className = '',
  priority = false,
  overlay = false,
  overlayColor = 'black',
  overlayOpacity = 0.5,
}: BackgroundImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        onLoad={() => setIsLoaded(true)}
      />
      
      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(0deg, ${overlayColor} ${overlayOpacity * 100}%, transparent 100%)`,
          }}
        />
      )}
      
      {!isLoaded && !priority && (
        <div className="absolute inset-0 bg-gray-300 animate-pulse" />
      )}
    </div>
  );
};

/**
 * Gallery component with lazy loading
 */
interface GalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: string;
  className?: string;
}

export const Gallery = ({ 
  images, 
  columns = 3, 
  gap = 'gap-4', 
  className = '' 
}: GalleryProps) => {
  const [visibleImages, setVisibleImages] = useState(new Set<number>());
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleImages(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const imageElements = containerRef.querySelectorAll('[data-index]');
    imageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerRef]);

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div 
      ref={setContainerRef}
      className={`grid ${gridClasses[columns as keyof typeof gridClasses]} ${gap} ${className}`}
    >
      {images.map((image, index) => (
        <div key={index} data-index={index} className="relative">
          {visibleImages.has(index) ? (
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-48 bg-gray-300 rounded-lg animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Image optimization utilities
 */
export const ImageOptimizer = {
  // Generate optimized image URL
  optimizeUrl: (src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}) => {
    const { width, height, quality = 75, format = 'webp' } = options;
    
    if (!src) return '';
    
    const url = new URL(src);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('fm', format);
    
    return url.toString();
  },

  // Check if image is optimized
  isOptimized: (src: string) => {
    return src.includes('w=') && src.includes('h=') && src.includes('q=');
  },

  // Generate blur placeholder
  generateBlurDataURL: async (src: string): Promise<string> => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return '';
      
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      canvas.width = 10;
      canvas.height = 10;
      ctx.drawImage(img, 0, 0, 10, 10);
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.1);
      URL.revokeObjectURL(img.src);
      
      return dataURL;
    } catch {
      return '';
    }
  },
};