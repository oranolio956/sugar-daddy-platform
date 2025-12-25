import React from 'react';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useToast = () => ({
  toast: (message: string) => console.log(message),
});