import React from 'react';

export const OptimizedImage = ({ src, alt, width, height, className }) => (
  <img src={src} alt={alt} width={width} height={height} className={className} />
);

export const Gallery = ({ children }) => <div>{children}</div>;

export const Avatar = ({ src, alt, size }) => (
  <img src={src} alt={alt} width={size} height={size} className="rounded-full" />
);