import { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useHumedad } from '../context/HumedadContext';

const Grafico = () => {
  const { sensores, datosGrafico, setDatosGrafico, isOnline } = useHumedad();

  // Actualizar gráfico con datos de Firebase
  useEffect(() => {
    if (sensores.sensor1 && sensores.sensor2) {
      setDatosGrafico(prevData => {
        const newPoint = {
          humedad1: sensores.sensor1.humedad || 0,
          humedad2: sensores.sensor2.humedad || 0,
          timestamp: new Date().getTime()
        };

        // Mantener solo los últimos 12 puntos
        const updatedData = [...prevData, newPoint];
        if (updatedData.length > 12) {
          updatedData.shift();
        }

        return updatedData;
      });
    }
  }, [sensores, setDatosGrafico]);

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
  const dataWithId = datosGrafico.map((p, idx) => ({ ...p, id: idx }));

  return (
    <div className="w-full px-4 py-8" style={{ transform: "none" }}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Control de la Humedad en Tiempo Real
            </h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline.sensor1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-semibold">
                  {sensores.sensor1?.planta || 'Sensor 1'}: {isOnline.sensor1 ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline.sensor2 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-semibold">
                  {sensores.sensor2?.planta || 'Sensor 2'}: {isOnline.sensor2 ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
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
                tickCount={datosGrafico.length}
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