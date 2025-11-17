import { useHumedad } from '../context/HumedadContext';

const Inicio = () => {
  const { humedadActual } = useHumedad();

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Humedad */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition-shadow duration-300">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Humedad</h3>
            <p className="text-2xl font-bold text-blue-600">
              <span className="text-blue-600">{humedadActual.alfalfa}%</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-red-600">{humedadActual.planta2}%</span>
            </p>
          </div>

          {/* Última vez regado */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition-shadow duration-300">
            <div className="text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Último riego</h3>
            <p className="text-lg font-bold text-green-600">Hace 2 horas</p>
          </div>

          {/* Cantidad de agua usada */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition-shadow duration-300">
            <div className="text-cyan-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Cantidad de agua usada</h3>
            <p className="text-3xl font-bold text-cyan-600">2.5 L</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Inicio;