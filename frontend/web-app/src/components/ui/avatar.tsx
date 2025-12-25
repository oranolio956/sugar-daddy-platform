import React from 'react';

export const Avatar = ({ src, alt, className = '', children }) => (
  <div className={`relative inline-block ${className}`}>
    {src ? (
      <img src={src} alt={alt} className="w-10 h-10 rounded-full" />
    ) : (
      children
    )}
  </div>
);

export const AvatarImage = ({ src, alt }) => (
  <img src={src} alt={alt} className="w-10 h-10 rounded-full" />
);

export const AvatarFallback = ({ children, className = '' }) => (
  <div className={`w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 ${className}`}>
    {children}
  </div>
);