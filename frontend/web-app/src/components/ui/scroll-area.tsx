import React from 'react';

export const ScrollArea = ({ children, className = '' }) => (
  <div className={`overflow-auto ${className}`}>
    {children}
  </div>
);