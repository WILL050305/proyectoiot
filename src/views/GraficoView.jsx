/**
 * VISTA: GraficoView
 * Vista del gráfico de humedad en tiempo real
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GraficoView = ({ datosGrafico, sensores, isOnline }) => {
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
  const dataWithId = datosGrafico.map((p, idx) => ({ ...p.toJSON(), id: idx }));

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
