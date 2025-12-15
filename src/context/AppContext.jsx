/**
 * CONTEXT: AppContext
 * Context principal que agrupa todos los controladores usando patrón MVC
 */

import { createContext, useContext } from 'react';
import { useSensorController } from '../controllers/SensorController';
import { usePlantaController } from '../controllers/PlantaController';
import { useHistorialController } from '../controllers/HistorialController';
import { useNavigationController } from '../controllers/NavigationController';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Controladores
  const sensorController = useSensorController();
  const plantaController = usePlantaController();
  const historialController = useHistorialController();
  const navigationController = useNavigationController();

  const value = {
    // Sensor Controller
    sensores: sensorController.sensores,
    isOnline: sensorController.isOnline,
    datosGrafico: sensorController.datosGrafico,
    toggleRiego: sensorController.toggleRiego,
    setDatosGrafico: sensorController.setDatosGrafico,

    // Planta Controller
    plantas: plantaController.plantas,
    loadingPlantas: plantaController.loading,
    errorPlantas: plantaController.error,
    fetchPlantas: plantaController.fetchPlantas,
    createPlanta: plantaController.createPlanta,
    updatePlanta: plantaController.updatePlanta,
    // Pasar sensores a deletePlanta para validación
    deletePlanta: (plantaId) => plantaController.deletePlanta(plantaId, sensorController.sensores),
    getPlantaById: plantaController.getPlantaById,
    createEmptyPlanta: plantaController.createEmptyPlanta,

    // Historial Controller
    historial: historialController.historial,
    loadingHistorial: historialController.loading,
    getHistorialBySensor: historialController.getHistorialBySensor,
    getUltimosRegistros: historialController.getUltimosRegistros,

    // Navigation Controller
    currentRoute: navigationController.currentRoute,
    showPlantas: navigationController.showPlantas,
    showConsumo: navigationController.showConsumo,
    showReportes: navigationController.showReportes,
    navigate: navigationController.navigate,
    closePlantas: navigationController.closePlantas,
    closeConsumo: navigationController.closeConsumo,
    closeReportes: navigationController.closeReportes
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
