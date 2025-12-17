/**
 * VISTA: GraficoView
 * Vista del gráfico de humedad en tiempo real con simulación
 */

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GraficoView = ({ datosGrafico, sensores, isOnline }) => {
  const [simulatedData, setSimulatedData] = useState([]);

  // Generar datos simulados
  const generateSimulatedData = () => {
    const newData = [];
    let humedad1 = 55;
    let humedad2 = 65;

    for (let i = 0; i < 12; i++) {
      // Simular variaciones naturales de humedad
      humedad1 += (Math.random() - 0.5) * 8;
      humedad2 += (Math.random() - 0.5) * 8;

      // Mantener valores dentro del rango 30-90%
      humedad1 = Math.max(30, Math.min(90, humedad1));
      humedad2 = Math.max(30, Math.min(90, humedad2));

      newData.push({
        humedad1: Math.round(humedad1),
        humedad2: Math.round(humedad2),
        timestamp: new Date(Date.now() - (11 - i) * 60000).getTime() // Intervalos de 1 minuto
      });
    }
    return newData;
  };

  // Inicializar datos simulados
  useEffect(() => {
    setSimulatedData(generateSimulatedData());
  }, []);

  // Actualizar gráfico con datos simulados cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedData(prevData => {
        if (prevData.length === 0) return prevData;

        let humedad1 = prevData[prevData.length - 1].humedad1;
        let humedad2 = prevData[prevData.length - 1].humedad2;

        // Simular variaciones naturales
        humedad1 += (Math.random() - 0.5) * 8;
        humedad2 += (Math.random() - 0.5) * 8;

        // Mantener valores dentro del rango 30-90%
        humedad1 = Math.max(30, Math.min(90, humedad1));
        humedad2 = Math.max(30, Math.min(90, humedad2));

        const newPoint = {
          humedad1: Math.round(humedad1),
          humedad2: Math.round(humedad2),
          timestamp: new Date().getTime()
        };

        // Mantener solo los últimos 12 puntos
        const updatedData = [...prevData, newPoint];
        if (updatedData.length > 12) {
          updatedData.shift();
        }

        return updatedData;
      });
    }, 10000); // Actualizar cada 10 segundos

    return () => clearInterval(interval);
  }, []);
  // Custom tooltip para mostrar información detallada
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const punto = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700">
            Tiempo: {new Date(punto.timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
          <p className="text-sm font-bold text-blue-600">
            {sensores.sensor1?.planta || 'Sensor 1'}: {punto.humedad1}%
          </p>
          <p className="text-sm font-bold text-red-600">
            {sensores.sensor2?.planta || 'Sensor 2'}: {punto.humedad2}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Agregar ID único a cada punto
  const dataWithId = simulatedData.map((p, idx) => ({ ...p, id: idx }));

  return (
    <div className="w-full px-4 py-8" style={{ transform: "none" }}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Control de la Humedad en Tiempo Real
            </h2>

          </div>
          
          <div style={{ width: "100%", height: 400, transform: "none" }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dataWithId} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  allowDataOverflow={true}
                  domain={['auto', 'auto']}
                  tickCount={simulatedData.length}
                  interval={0}
                  angle={-90}
                  textAnchor="end"
                  height={100}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  }
                />
                <YAxis 
                  domain={[0, 100]} 
                  label={{ value: 'Humedad (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="humedad1" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name={sensores.sensor1?.planta || 'Sensor 1'}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="humedad2" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name={sensores.sensor2?.planta || 'Sensor 2'}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficoView;
