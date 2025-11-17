import { createContext, useContext, useState } from 'react';

const HumedadContext = createContext();

export const useHumedad = () => {
  const context = useContext(HumedadContext);
  if (!context) {
    throw new Error('useHumedad debe usarse dentro de HumedadProvider');
  }
  return context;
};

export const HumedadProvider = ({ children }) => {
  const [humedadActual, setHumedadActual] = useState({ alfalfa: 65, planta2: 65 });

  return (
    <HumedadContext.Provider value={{ humedadActual, setHumedadActual }}>
      {children}
    </HumedadContext.Provider>
  );
};
