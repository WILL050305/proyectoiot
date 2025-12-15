import { useHumedad } from '../context/HumedadContext';

const Inicio = () => {
  const { sensores, historial } = useHumedad();

  // Función para obtener el último riego de cada sensor
  const getUltimoRiego = (sensorId) => {
    if (!historial || historial.length === 0) return 'Sin datos';
    
    // Filtrar riegos ON del sensor específico
    const riegosON = historial
      .filter(item => item.sensor === sensorId && item.accion.includes('ON'))
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (riegosON.length === 0) return 'Sin riego';
    
    const ultimoRiego = riegosON[0];
    const ahora = Date.now();
    const tiempoRiego = ultimoRiego.timestamp * 1000;
    const diferencia = ahora - tiempoRiego;
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `Hace ${minutos} min`;
    return 'Hace un momento';
  };

  return (
    <main className="pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Bienvenido al Panel de Control
          </h1>
          <p className="text-lg text-gray-600">
            Monitoreo en tiempo real los niveles de humedad y controla el sistema de riego automático
          </p>
        </div>

        {/* Tarjetas de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Humedad */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition-shadow duration-300">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Humedad Actual</h3>
            <p className="text-2xl font-bold">
              <span className="text-blue-600">{sensores.sensor1?.humedad || 0}%</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-red-600">{sensores.sensor2?.humedad || 0}%</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <span className="text-blue-600">{sensores.sensor1?.planta || 'Sensor 1'}</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-red-600">{sensores.sensor2?.planta || 'Sensor 2'}</span>
            </p>
          </div>

          {/* Última vez regado */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition-shadow duration-300">
            <div className="text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Último Riego</h3>
            <p className="text-lg font-bold">
              <span className="text-blue-600">{getUltimoRiego('sensor1')}</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-red-600">{getUltimoRiego('sensor2')}</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <span className="text-blue-600">{sensores.sensor1?.planta || 'Sensor 1'}</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-red-600">{sensores.sensor2?.planta || 'Sensor 2'}</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Inicio;