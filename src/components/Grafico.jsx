import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useHumedad } from '../context/HumedadContext';

const Grafico = () => {
  const [data, setData] = useState([]);
  const { setHumedadActual } = useHumedad();

  // Generar datos iniciales
  useEffect(() => {
    const initialData = [];
    const now = new Date();
    
    for (let i = 9; i >= 0; i--) {
      const time = new Date(now - i * 10000);
      const humedad1 = Math.floor(Math.random() * 30) + 50; // Humedad 1 entre 50-80%
      const humedad2 = Math.floor(Math.random() * 30) + 50; // Humedad 2 entre 50-80%
      initialData.push({
        humedad1,
        humedad2,
        timestamp: time.getTime()
      });
    }
    
    setData(initialData);
    // Actualizar humedad actual con los últimos valores
    if (initialData.length > 0) {
      const ultimo = initialData[initialData.length - 1];
      setHumedadActual({ alfalfa: ultimo.humedad1, planta2: ultimo.humedad2 });
    }
  }, [setHumedadActual]);

  // Actualizar datos cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newTime = new Date();
        const humedad1 = Math.floor(Math.random() * 30) + 50;
        const humedad2 = Math.floor(Math.random() * 30) + 50;
        const newPoint = {
          humedad1,
          humedad2,
          timestamp: newTime.getTime()
        };

        // Actualizar ambas humedades en el contexto
        setHumedadActual({ alfalfa: humedad1, planta2: humedad2 });

        // Mantener solo los últimos 20 puntos
        const updatedData = [...prevData, newPoint];
        if (updatedData.length > 20) {
          updatedData.shift();
        }

        return updatedData;
      });
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [setHumedadActual]);

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
            Alfalfa: {punto.humedad1}%
          </p>
          <p className="text-sm font-bold text-red-600">
            Planta 2: {punto.humedad2}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Agregar ID único a cada punto
  const dataWithId = data.map((p, idx) => ({ ...p, id: idx }));

  return (
    <div className="w-full px-4 py-8" style={{ transform: "none" }}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Control de la Humedad en Tiempo Real
          </h2>
          
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
                tickCount={data.length}
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
                label={{ value: 'Humedad (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip content={CustomTooltip} cursor={{ stroke: '#666', strokeWidth: 1 }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="humedad1"
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', r: 4 }}
                activeDot={{ r: 8, stroke: '#1e40af', strokeWidth: 2 }}
                name="Alfalfa"
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <Line 
                type="monotone" 
                dataKey="humedad2"
                stroke="#dc2626" 
                strokeWidth={2}
                dot={{ fill: '#dc2626', r: 4 }}
                activeDot={{ r: 8, stroke: '#b91c1c', strokeWidth: 2 }}
                name="Planta 2"
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grafico;