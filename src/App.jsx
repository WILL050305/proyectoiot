/**
 * APLICACIÓN PRINCIPAL CON ARQUITECTURA MVC
 * 
 * Estructura:
 * - Models: Definen la estructura de datos (SensorModel, PlantaModel, etc.)
 * - Views: Componentes React de presentación (HeaderView, GraficoView, etc.)
 * - Controllers: Lógica de negocio usando custom hooks (useSensorController, etc.)
 * - Services: Comunicación con Firebase (FirebaseService, FirestoreService)
 * 
 * El Context (AppContext) centraliza todos los controladores y 
 * proporciona los datos y funciones a las vistas
 */

import './App.css'
import { AppProvider, useAppContext } from './context/AppContext'
import { useEffect, useState } from 'react'
import { AuthService } from './services/AuthService'

// Importar Vistas
import HeaderView from './views/HeaderView'
import InicioView from './views/InicioView'
import GraficoView from './views/GraficoView'
import UnitarioView from './views/UnitarioView'
import PlantasView from './views/PlantasView'
import ConsumoAguaView from './views/ConsumoAguaView'
import ReportesView from './views/ReportesView'

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Autenticación automática al iniciar
  useEffect(() => {
    const authenticate = async () => {
      console.log('🔑 Iniciando autenticación...');
      const result = await AuthService.autoLogin();
      
      if (result.success) {
        console.log('✅ Autenticación exitosa');
        setIsAuthenticated(true);
      } else {
        console.error('❌ Error de autenticación:', result.error);
        alert('Error de autenticación. Verifica las credenciales en Firebase.');
      }
      setIsAuthenticating(false);
    };

    authenticate();

    // Escuchar cambios en el estado de autenticación
    const unsubscribe = AuthService.onAuthChange((user) => {
      console.log('👤 Estado de autenticación cambió:', user ? 'Autenticado' : 'No autenticado');
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Obtener datos y funciones del contexto MVC
  const {
    // Sensor data
    sensores,
    isOnline,
    datosGrafico,
    toggleRiego,
    
    // Planta data
    plantas,
    loadingPlantas,
    createPlanta,
    updatePlanta,
    deletePlanta,
    createEmptyPlanta,
    
    // Historial data
    historial,
    
    // Navigation
    showPlantas,
    showConsumo,
    showReportes,
    navigate,
    closePlantas,
    closeConsumo,
    closeReportes
  } = useAppContext();

  // Controlar scroll del body cuando el modal de plantas está activo
  useEffect(() => {
    if (showPlantas || showConsumo || showReportes) {
      // Desactivar scroll del body
      document.body.style.overflow = 'hidden';
    } else {
      // Reactivar scroll del body
      document.body.style.overflow = 'auto';
    }

    // Cleanup: restaurar scroll al desmontar
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPlantas, showConsumo, showReportes]);

  // Mostrar indicador de carga mientras se autentica
  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Autenticando...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600">No se pudo autenticar con Firebase.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Vista de Header con navegación */}
      <HeaderView onNavigate={navigate} />
      
      {/* Vista de Inicio */}
      <InicioView 
        sensores={sensores} 
        historial={historial} 
      />
      
      {/* Vista de Gráfico */}
      <GraficoView 
        datosGrafico={datosGrafico}
        sensores={sensores}
        isOnline={isOnline}
      />
      
      {/* Vista de Control Unitario */}
      <UnitarioView 
        datosGrafico={datosGrafico}
        sensores={sensores}
        onToggleRiego={toggleRiego}
      />
      
      {/* Modal flotante de Plantas */}
      {showPlantas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
            {/* Botón cerrar */}
            <button
              onClick={closePlantas}
              className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-lg transition-all duration-200 hover:scale-110"
              title="Cerrar"
            >
              ✕
            </button>
            {/* Vista de Plantas */}
            <div className="overflow-y-auto max-h-[90vh]">
              <PlantasView 
                plantas={plantas}
                loading={loadingPlantas}
                onCreatePlanta={createPlanta}
                onUpdatePlanta={updatePlanta}
                onDeletePlanta={deletePlanta}
                createEmptyPlanta={createEmptyPlanta}
                sensores={sensores}
              />
            </div>
          </div>
        </div>
      )}

      {/* Vista de Consumo de Agua */}
      {showConsumo && (
        <div className="fixed inset-0 z-50 overflow-auto">
          {/* Botón cerrar flotante */}
          <button
            onClick={closeConsumo}
            className="fixed top-20 right-8 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg transition-all duration-200 hover:scale-110"
            title="Cerrar"
          >
            ✕
          </button>
          {/* Vista de Consumo */}
          <ConsumoAguaView 
            sensores={sensores}
            plantas={plantas}
          />
        </div>
      )}

      {/* Vista de Reportes */}
      {showReportes && (
        <div className="fixed inset-0 z-50 overflow-auto">
          {/* Vista de Reportes */}
          <ReportesView 
            historial={historial}
            sensores={sensores}
            plantas={plantas}
            onClose={closeReportes}
          />
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App