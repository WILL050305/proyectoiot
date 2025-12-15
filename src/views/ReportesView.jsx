/**
 * VISTA: ReportesView
 * Vista de reportes con historial filtrable y exportación a Excel
 */

import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';

const ReportesView = ({ historial, sensores, plantas, onClose }) => {
  const [filtroTiempo, setFiltroTiempo] = useState('todo'); // dia, semana, mes, año, todo, personalizado
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [historialFiltrado, setHistorialFiltrado] = useState([]);

  useEffect(() => {
    filtrarHistorial();
  }, [historial, filtroTiempo, fechaInicio, fechaFin]);

  const getNombrePlanta = (sensorId) => {
    const plantaId = sensores[sensorId]?.planta;
    if (!plantaId) return sensorId;
    const planta = plantas.find(p => p.id === plantaId);
    return planta?.nombre || plantaId;
  };

  const filtrarHistorial = () => {
    if (!historial || historial.length === 0) {
      setHistorialFiltrado([]);
      return;
    }

    const ahora = new Date();
    let fechaLimite;
    let fechaFinLimite = ahora;

    // Si es filtro personalizado, usar las fechas seleccionadas
    if (filtroTiempo === 'personalizado' && fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      
      const timestampInicio = Math.floor(inicio.getTime() / 1000);
      const timestampFin = Math.floor(fin.getTime() / 1000);

      const filtrado = historial
        .filter(item => item.timestamp >= timestampInicio && item.timestamp <= timestampFin)
        .sort((a, b) => b.timestamp - a.timestamp);

      setHistorialFiltrado(filtrado);
      return;
    }

    switch (filtroTiempo) {
      case 'dia':
        // Últimas 24 horas
        fechaLimite = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'semana':
        // Últimos 7 días
        fechaLimite = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        // Últimos 30 días
        fechaLimite = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'año':
        // Últimos 365 días
        fechaLimite = new Date(ahora.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'todo':
        fechaLimite = new Date(0); // Desde el principio
        break;
      default:
        fechaLimite = new Date(0);
    }

    const timestampLimite = Math.floor(fechaLimite.getTime() / 1000);

    // Filtrar y ordenar por más nuevo primero
    const filtrado = historial
      .filter(item => item.timestamp >= timestampLimite)
      .sort((a, b) => b.timestamp - a.timestamp);

    setHistorialFiltrado(filtrado);
  };

  const exportarExcel = () => {
    if (historialFiltrado.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Preparar datos para Excel
    const datosExcel = historialFiltrado.map(item => ({
      'Fecha y Hora': item.fecha,
      'Sensor': item.sensor,
      'Planta': getNombrePlanta(item.sensor),
      'Acción': item.accion,
      'Timestamp': item.timestamp
    }));

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosExcel);

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 20 }, // Fecha y Hora
      { wch: 10 }, // Sensor
      { wch: 15 }, // Planta
      { wch: 30 }, // Acción
      { wch: 12 }  // Timestamp
    ];

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');

    // Generar nombre de archivo con fecha actual
    const fechaExport = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Historial_Riego_${filtroTiempo}_${fechaExport}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, nombreArchivo);
  };

  const estadisticas = useMemo(() => {
    const stats = {
      totalEventos: historialFiltrado.length,
      riegosON: 0,
      riegosOFF: 0,
      porSensor: {}
    };

    historialFiltrado.forEach(item => {
      // Contar ON/OFF
      if (item.accion.toLowerCase().includes('on')) {
        stats.riegosON++;
      } else if (item.accion.toLowerCase().includes('off')) {
        stats.riegosOFF++;
      }

      // Contar por sensor - excluir sensor_test
      if (item.sensor !== 'sensor_test') {
        if (!stats.porSensor[item.sensor]) {
          stats.porSensor[item.sensor] = 0;
        }
        stats.porSensor[item.sensor]++;
      }
    });

    return stats;
  }, [historialFiltrado]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2"
              title="Volver"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-4xl font-bold text-gray-800">📊 Reportes e Historial</h1>
          </div>
          <p className="text-gray-600">Visualiza y exporta el historial de eventos del sistema</p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Eventos</p>
            <p className="text-2xl font-bold text-blue-600">{estadisticas.totalEventos}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Riegos ON</p>
            <p className="text-2xl font-bold text-green-600">{estadisticas.riegosON}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Riegos OFF</p>
            <p className="text-2xl font-bold text-red-600">{estadisticas.riegosOFF}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Total Riegos</p>
            <p className="text-2xl font-bold text-purple-600">
              {estadisticas.riegosON + estadisticas.riegosOFF}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-cyan-500">
            <p className="text-gray-500 text-sm">Sensores Activos</p>
            <p className="text-2xl font-bold text-cyan-600">
              {Object.keys(estadisticas.porSensor).length}
            </p>
          </div>
        </div>

        {/* Controles de filtros y exportación */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Fila 1: Filtros de tiempo */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroTiempo('dia')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroTiempo === 'dia'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📅 Día
              </button>
              <button
                onClick={() => setFiltroTiempo('semana')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroTiempo === 'semana'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📆 Semana
              </button>
              <button
                onClick={() => setFiltroTiempo('mes')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroTiempo === 'mes'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🗓️ Mes
              </button>
              <button
                onClick={() => setFiltroTiempo('año')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroTiempo === 'año'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Año
              </button>
              <button
                onClick={() => setFiltroTiempo('todo')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroTiempo === 'todo'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🌐 Todo
              </button>
              <button
                onClick={() => setFiltroTiempo('personalizado')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroTiempo === 'personalizado'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Personalizado
              </button>
            </div>

            {/* Fila 2: Filtro personalizado por rango de fechas */}
            {filtroTiempo === 'personalizado' && (
              <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Desde:</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Hasta:</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setFechaInicio('');
                    setFechaFin('');
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  title="Reiniciar fechas"
                >
                  🔄 Reiniciar
                </button>
                {fechaInicio && fechaFin && (
                  <span className="text-sm text-green-600 font-medium">✓ Filtro aplicado</span>
                )}
              </div>
            )}

            {/* Fila 3: Botón de exportación e indicador */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-sm text-gray-600">
                Mostrando: <span className="font-semibold">{historialFiltrado.length}</span> eventos
                {filtroTiempo === 'dia' && ' de las últimas 24 horas'}
                {filtroTiempo === 'semana' && ' de los últimos 7 días'}
                {filtroTiempo === 'mes' && ' de los últimos 30 días'}
                {filtroTiempo === 'año' && ' de los últimos 365 días'}
                {filtroTiempo === 'todo' && ' (historial completo)'}
                {filtroTiempo === 'personalizado' && fechaInicio && fechaFin && ` del ${fechaInicio} al ${fechaFin}`}
              </div>

              <button
                onClick={exportarExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-all flex items-center justify-center gap-2"
                disabled={historialFiltrado.length === 0}
              >
                <span>📥</span>
                <span>Exportar a Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de historial */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {historialFiltrado.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">No hay eventos</p>
              <p className="text-gray-500">No se encontraron eventos en el periodo seleccionado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sensor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Planta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historialFiltrado.map((item, index) => {
                    const esON = item.accion.toLowerCase().includes('on');
                    const esOFF = item.accion.toLowerCase().includes('off');
                    
                    // Formatear fecha desde timestamp si no existe el campo fecha
                    const fechaFormateada = item.fecha || new Date(item.timestamp * 1000).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });
                    
                    return (
                      <tr key={item.timestamp || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fechaFormateada}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                          {item.sensor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="capitalize">{getNombrePlanta(item.sensor)}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {item.accion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {esON && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ ON
                            </span>
                          )}
                          {esOFF && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ✕ OFF
                            </span>
                          )}
                          {!esON && !esOFF && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              ⚙️ Otro
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportesView;
