import React, { createContext, useContext, useState } from 'react';

interface SEOContextType {
  updateStructuredData: (type: string, data: any) => void;
}

const SEOContext = createContext<SEOContextType>({
  updateStructuredData: () => {},
});

export const useSEO = () => useContext(SEOContext);

export const SEOProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [structuredData, setStructuredData] = useState<Record<string, any>>({});

  const updateStructuredData = (type: string, data: any) => {
    setStructuredData(prev => ({ ...prev, [type]: data }));
  };

  return (
    <SEOContext.Provider value={{ updateStructuredData }}>
      {children}
    </SEOContext.Provider>
  );
};