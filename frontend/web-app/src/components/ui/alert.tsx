import React from 'react';

export const Alert = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-blue-50 border border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border border-red-200 text-red-800',
  };

  return (
    <div className={`p-4 rounded-md ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ children, className = '' }) => (
  <h5 className={`mb-1 font-medium ${className}`}>
    {children}
  </h5>
);

export const AlertDescription = ({ children, className = '' }) => (
  <div className={`text-sm ${className}`}>
    {children}
  </div>
);