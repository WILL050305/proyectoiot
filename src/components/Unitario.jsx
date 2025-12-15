import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useHumedad } from '../context/HumedadContext';

const Unitario = () => {
  const { datosGrafico, sensores, toggleRiego, historial } = useHumedad();
  const [loading, setLoading] = useState({ sensor1: false, sensor2: false });

  // Extraer últimos 8 puntos para Alfalfa
  const dataAlfalfa = useMemo(() => {
    return datosGrafico.slice(-8).map(d => ({
      humedad: d.humedad1,
      timestamp: d.timestamp
    }));
  }, [datosGrafico]);

  // Extraer últimos 8 puntos para Planta 2
  const dataPlanta2 = useMemo(() => {
    return datosGrafico.slice(-8).map(d => ({
      humedad: d.humedad2,
      timestamp: d.timestamp
    }));
  }, [datosGrafico]);


  // ===========================
  //   BOTÓN ENCENDER / APAGAR
  // ===========================
  const handleToggleRiego = async (sensorId) => {
    setLoading(prev => ({ ...prev, [sensorId]: true }));

    try {
      const sensor = sensores[sensorId];
      if (!sensor) {
        alert("Error: Sensor no disponible");
        setLoading(prev => ({ ...prev, [sensorId]: false }));
        return;
      }

      // ===========================
      // Relé activo en LOW:
      // rele_estado = 0 → encendido
      // rele_estado = 1 → apagado
      // ===========================
      const estaEncendido = sensor.rele_estado === 0;
      const nuevoEstado = estaEncendido ? 1 : 0;

      console.log(`${sensorId} → Estado actual: ${sensor.rele_estado}`);
      console.log(`${sensorId} → Cambiando a: ${nuevoEstado}`);

      await toggleRiego(sensorId, nuevoEstado);
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

          {/* ==================== SENSOR 1 ===================== */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-semibold text-blue-600 mb-4 text-center">
              {sensores.sensor1?.planta || 'Sensor 1'}
            </h3>

            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600">
                Humedad Actual: <span className="font-bold text-blue-600">{sensores.sensor1?.humedad || 0}%</span>
              </p>
              <p className="text-sm text-gray-600">
                Humedad Mínima: <span className="font-bold">{sensores.sensor1?.humedad_minima || 0}%</span>
              </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dataAlfalfa}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={['auto', 'auto']}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                  }
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip content={CustomTooltip} />
                <Line type="monotone" dataKey="humedad" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 text-center">
              {/* BOTÓN */}
              <button
                onClick={() => handleToggleRiego('sensor1')}
                disabled={loading.sensor1}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                  sensores.sensor1?.rele_estado === 0
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
              >
                {loading.sensor1
                  ? "Procesando..."
                  : sensores.sensor1?.rele_estado === 0
                  ? "💧 Apagar Riego"
                  : "🚿 Activar Riego"}
              </button>

              {sensores.sensor1?.rele_estado === 0 && (
                <p className="text-sm text-green-600 font-semibold mt-2">🟢 Riego activo</p>
              )}
            </div>
          </div>


          {/* ==================== SENSOR 2 ===================== */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-semibold text-red-600 mb-4 text-center">
              {sensores.sensor2?.planta || 'Sensor 2'}
            </h3>

            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600">
                Humedad Actual: <span className="font-bold text-red-600">{sensores.sensor2?.humedad || 0}%</span>
              </p>
              <p className="text-sm text-gray-600">
                Humedad Mínima: <span className="font-bold">{sensores.sensor2?.humedad_minima || 0}%</span>
              </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dataPlanta2}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={['auto', 'auto']}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                  }
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip content={CustomTooltip} />
                <Line type="monotone" dataKey="humedad" stroke="#dc2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 text-center">
              {/* BOTÓN */}
              <button
                onClick={() => handleToggleRiego('sensor2')}
                disabled={loading.sensor2}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                  sensores.sensor2?.rele_estado === 0
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
              >
                {loading.sensor2
                  ? "Procesando..."
                  : sensores.sensor2?.rele_estado === 0
                  ? "💧 Apagar Riego"
                  : "🚿 Activar Riego"}
              </button>

              {sensores.sensor2?.rele_estado === 0 && (
                <p className="text-sm text-green-600 font-semibold mt-2">🟢 Riego activo</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Unitario;
