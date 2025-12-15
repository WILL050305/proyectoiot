/**
 * VISTA: UnitarioView
 * Vista del control individual de cada sensor
 */

import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UnitarioView = ({ datosGrafico, sensores, onToggleRiego }) => {
  const [loading, setLoading] = useState({ sensor1: false, sensor2: false });

  // Extraer últimos 8 puntos para Sensor 1
  const dataSensor1 = useMemo(() => {
    return datosGrafico.slice(-8).map(d => ({
      humedad: d.humedad1,
      timestamp: d.timestamp
    }));
  }, [datosGrafico]);

  // Extraer últimos 8 puntos para Sensor 2
  const dataSensor2 = useMemo(() => {
    return datosGrafico.slice(-8).map(d => ({
      humedad: d.humedad2,
      timestamp: d.timestamp
    }));
  }, [datosGrafico]);

  // Manejar toggle de riego
  const handleToggleRiego = async (sensorId) => {
    setLoading(prev => ({ ...prev, [sensorId]: true }));

    try {
      const sensor = sensores[sensorId];
      if (!sensor) {
        alert("Error: Sensor no disponible");
        setLoading(prev => ({ ...prev, [sensorId]: false }));
        return;
      }

      // Relé activo en LOW: rele_estado = 0 → encendido, rele_estado = 1 → apagado
      const estaEncendido = sensor.rele_estado === 0;
      const nuevoEstado = estaEncendido ? 1 : 0;

      console.log(`${sensorId} → Estado actual: ${sensor.rele_estado}`);
      console.log(`${sensorId} → Cambiando a: ${nuevoEstado}`);

      await onToggleRiego(sensorId, nuevoEstado);
      console.log("✔️ Estado cambiado correctamente");

    } catch (error) {
      console.error("Error al cambiar estado de riego:", error);
      alert("Error al cambiar estado del riego.");
    }

    setTimeout(() => {
      setLoading(prev => ({ ...prev, [sensorId]: false }));
    }, 800);
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-700">
            {new Date(label).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
          <p className="text-sm font-bold" style={{ color: payload[0].color }}>
            Humedad: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Control Individual de Humedad
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SENSOR 1 */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-semibold text-blue-600 mb-4 text-center">
              {sensores.sensor1?.planta || 'Sensor 1'}
            </h3>

            {/* Gráfico */}
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dataSensor1} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  }
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="humedad" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Información */}
            <div className="mt-4 space-y-2">
              <p className="text-lg">
                <span className="font-semibold">Humedad actual:</span> 
                <span className="ml-2 text-blue-600 font-bold">{sensores.sensor1?.humedad || 0}%</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Estado del riego:</span>
                <span className={`ml-2 font-bold ${sensores.sensor1?.estaRiegoActivo() ? 'text-green-600' : 'text-gray-500'}`}>
                  {sensores.sensor1?.estaRiegoActivo() ? 'ENCENDIDO' : 'APAGADO'}
                </span>
              </p>
            </div>

            {/* Botón */}
            <button
              onClick={() => handleToggleRiego('sensor1')}
              disabled={loading.sensor1}
              className={`
                mt-4 w-full py-3 px-4 rounded-lg font-semibold text-white
                transition-all duration-300
                ${sensores.sensor1?.estaRiegoActivo() 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'}
                ${loading.sensor1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `}
            >
              {loading.sensor1 
                ? 'Procesando...' 
                : sensores.sensor1?.estaRiegoActivo() 
                  ? 'APAGAR RIEGO' 
                  : 'ENCENDER RIEGO'}
            </button>
          </div>

          {/* SENSOR 2 */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-semibold text-red-600 mb-4 text-center">
              {sensores.sensor2?.planta || 'Sensor 2'}
            </h3>

            {/* Gráfico */}
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dataSensor2} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  }
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="humedad" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Información */}
            <div className="mt-4 space-y-2">
              <p className="text-lg">
                <span className="font-semibold">Humedad actual:</span>
                <span className="ml-2 text-red-600 font-bold">{sensores.sensor2?.humedad || 0}%</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Estado del riego:</span>
                <span className={`ml-2 font-bold ${sensores.sensor2?.estaRiegoActivo() ? 'text-green-600' : 'text-gray-500'}`}>
                  {sensores.sensor2?.estaRiegoActivo() ? 'ENCENDIDO' : 'APAGADO'}
                </span>
              </p>
            </div>

            {/* Botón */}
            <button
              onClick={() => handleToggleRiego('sensor2')}
              disabled={loading.sensor2}
              className={`
                mt-4 w-full py-3 px-4 rounded-lg font-semibold text-white
                transition-all duration-300
                ${sensores.sensor2?.estaRiegoActivo() 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'}
                ${loading.sensor2 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `}
            >
              {loading.sensor2 
                ? 'Procesando...' 
                : sensores.sensor2?.estaRiegoActivo() 
                  ? 'APAGAR RIEGO' 
                  : 'ENCENDER RIEGO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitarioView;
