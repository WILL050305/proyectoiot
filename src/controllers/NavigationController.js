/**
 * CONTROLADOR: NavigationController
 * Custom Hook que maneja la lógica de navegación
 */

import { useState, useCallback } from 'react';

export const useNavigationController = () => {
  const [currentRoute, setCurrentRoute] = useState('/');
  const [showPlantas, setShowPlantas] = useState(false);
  const [showConsumo, setShowConsumo] = useState(false);
  const [showReportes, setShowReportes] = useState(false);

  // Navegar a una ruta
  const navigate = useCallback((route) => {
    console.log('Navegar a:', route);
    setCurrentRoute(route);
    
    if (route === '/plantas') {
      setShowPlantas(true);
      setShowConsumo(false);
      setShowReportes(false);
    } else if (route === '/consumo') {
      setShowConsumo(true);
      setShowPlantas(false);
      setShowReportes(false);
    } else if (route === '/reportes') {
      setShowReportes(true);
      setShowPlantas(false);
      setShowConsumo(false);
    } else {
      setShowPlantas(false);
      setShowConsumo(false);
      setShowReportes(false);
    }
  }, []);

  // Cerrar modal de plantas
  const closePlantas = useCallback(() => {
    setShowPlantas(false);
    setCurrentRoute('/');
  }, []);

  // Cerrar vista de consumo
  const closeConsumo = useCallback(() => {
    setShowConsumo(false);
    setCurrentRoute('/');
  }, []);

  // Cerrar vista de reportes
  const closeReportes = useCallback(() => {
    setShowReportes(false);
    setCurrentRoute('/');
  }, []);

  return {
    currentRoute,
    showPlantas,
    showConsumo,
    showReportes,
    navigate,
    closePlantas,
    closeConsumo,
    closeReportes
  };
};

export default useNavigationController;
