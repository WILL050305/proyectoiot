/**
 * VISTA: ConsumoAguaView
 * Muestra estadísticas de consumo de agua basadas en el historial
 */

import { useState, useEffect } from 'react';
import { ConsumoAguaService } from '../services/ConsumoAguaService';

const ConsumoAguaView = ({ sensores = {}, plantas = [] }) => {
  const [loading, setLoading] = useState(true);
  const [consumoTotal, setConsumoTotal] = useState(null);
  const [consumoPorDia, setConsumoPorDia] = useState([]);
  const [consumoPorSensor, setConsumoPorSensor] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [selectedView, setSelectedView] = useState('resumen'); // resumen, porDia, porSensor, periodos

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar todos los datos
      const [totalResult, diaResult, sensorResult] = await Promise.all([
        ConsumoAguaService.calcularConsumoTotal(),
        ConsumoAguaService.calcularConsumoPorDia(),
        ConsumoAguaService.calcularConsumoPorSensor()
      ]);

      if (totalResult.success) {
        setConsumoTotal(totalResult.data.consumoTotal);
        setPeriodos(totalResult.data.periodos);
      }

      if (diaResult.success) {
        setConsumoPorDia(diaResult.data);
      }

      if (sensorResult.success) {
        setConsumoPorSensor(sensorResult.data);
      }
    } catch (error) {
      console.error('Error al cargar datos de consumo:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNombrePlanta = (sensorId) => {
    const plantaId = sensores[sensorId]?.planta;
    if (!plantaId) return 'Sin asignar';
    const planta = plantas.find(p => p.id === plantaId);
    return planta?.nombre || plantaId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">💧</div>
          <p className="text-gray-600">Calculando consumo de agua...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">💧 Consumo de Agua</h1>
          <p className="text-gray-600">Análisis del consumo de agua basado en el historial de riegos</p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Consumo Total */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Consumo Total</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {consumoTotal ? `${consumoTotal} L` : '0 L'}
                </p>
              </div>
              <div className="text-5xl">💧</div>
            </div>
          </div>

          {/* Total de Riegos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total de Riegos</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{periodos.length}</p>
              </div>
              <div className="text-5xl">🚿</div>
            </div>
          </div>

          {/* Tasa de Flujo */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Tasa de Flujo</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">1.67 L/min</p>
                <p className="text-sm text-gray-500">28 ml/seg</p>
              </div>
              <div className="text-5xl">⚡</div>
            </div>
          </div>
        </div>

        {/* Navegación de vistas */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setSelectedView('resumen')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              selectedView === 'resumen'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Resumen
          </button>
          <button
            onClick={() => setSelectedView('porDia')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              selectedView === 'porDia'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📅 Por Día
          </button>
          <button
            onClick={() => setSelectedView('porSensor')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              selectedView === 'porSensor'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🌱 Por Planta
          </button>
          <button
            onClick={() => setSelectedView('periodos')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              selectedView === 'periodos'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⏱️ Periodos
          </button>
        </div>

        {/* Contenido según vista seleccionada */}
        {selectedView === 'resumen' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consumo por día */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📅 Últimos Días</h3>
              {consumoPorDia.length > 0 ? (
                <div className="space-y-3">
                  {consumoPorDia.slice(0, 5).map((dia) => (
                    <div key={dia.fecha} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{dia.fecha}</p>
                        <p className="text-sm text-gray-600">{dia.totalRiegos} riegos</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{dia.consumoLitros} L</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
              )}
            </div>

            {/* Consumo por sensor */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🌱 Por Planta</h3>
              {consumoPorSensor.length > 0 ? (
                <div className="space-y-3">
                  {consumoPorSensor.map((sensor) => (
                    <div key={sensor.sensor} className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-gray-800">{getNombrePlanta(sensor.sensor)}</p>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{sensor.sensor}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{sensor.totalRiegos} riegos</span>
                        <span>{sensor.duracionTotalMinutos} min</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-2xl font-bold text-green-600">{sensor.consumoLitros} L</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
              )}
            </div>
          </div>
        )}

        {selectedView === 'porDia' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📅 Consumo por Día</h3>
            {consumoPorDia.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Riegos</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Consumo (L)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consumoPorDia.map((dia) => (
                      <tr key={dia.fecha} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dia.fecha}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{dia.totalRiegos}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">
                          {dia.consumoLitros} L
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
            )}
          </div>
        )}

        {selectedView === 'porSensor' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">🌱 Consumo por Planta/Sensor</h3>
            {consumoPorSensor.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {consumoPorSensor.map((sensor) => (
                  <div key={sensor.sensor} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-gray-800">{getNombrePlanta(sensor.sensor)}</h4>
                      <span className="text-xs bg-gray-200 px-3 py-1 rounded-full">{sensor.sensor}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Consumo Total:</span>
                        <span className="text-2xl font-bold text-blue-600">{sensor.consumoLitros} L</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Riegos:</span>
                        <span className="text-lg font-semibold text-gray-800">{sensor.totalRiegos}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tiempo Total:</span>
                        <span className="text-lg font-semibold text-gray-800">{sensor.duracionTotalMinutos} min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Promedio por Riego:</span>
                        <span className="text-lg font-semibold text-green-600">
                          {(sensor.consumoLitros / sensor.totalRiegos).toFixed(2)} L
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
            )}
          </div>
        )}

        {selectedView === 'periodos' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">⏱️ Todos los Periodos de Riego</h3>
            {periodos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sensor/Planta</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inicio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Duración (min)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Consumo (L)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {periodos.slice().reverse().map((periodo, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{getNombrePlanta(periodo.sensor)}</div>
                          <div className="text-xs text-gray-500">{periodo.sensor}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{periodo.fechaInicio}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{periodo.fechaFin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                          {periodo.duracionMinutos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">
                          {periodo.consumoLitros} L
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay periodos registrados</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumoAguaView;
