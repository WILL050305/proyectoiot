/**
 * VISTA: PlantasView
 * Vista para la gestión CRUD de plantas
 */

import { useState } from 'react';
import { SensorAssignmentService } from '../services/SensorAssignmentService';

const PlantasView = ({ 
  plantas, 
  loading, 
  onCreatePlanta, 
  onUpdatePlanta, 
  onDeletePlanta,
  createEmptyPlanta,
  sensores = {} // Agregar sensores como prop
}) => {
  const [formData, setFormData] = useState(createEmptyPlanta().toFormData());
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Verificar si una planta está asignada a algún sensor
  const isPlantaAsignada = (plantaId) => {
    return Object.values(sensores).some(sensor => sensor?.planta === plantaId);
  };

  // Obtener el sensor al que está asignada la planta
  const getSensorAsignado = (plantaId) => {
    const sensor = Object.entries(sensores).find(([key, sensor]) => sensor?.planta === plantaId);
    return sensor ? sensor[0] : null;
  };

  // Manejar asignación de planta a sensor
  const handleAssignToSensor = async (plantaId, sensorId) => {
    try {
      const result = await SensorAssignmentService.assignPlantaToSensor(sensorId, plantaId);
      if (result.success) {
        const planta = plantas.find(p => p.id === plantaId);
        alert(`✅ Planta asignada exitosamente al ${sensorId.toUpperCase()}\n📊 Humedad mínima actualizada: ${planta?.humedad_minima_recomendada}%`);
      } else {
        alert('Error al asignar planta al sensor');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al asignar planta');
    }
  };

  // Manejar desasignación de planta
  const handleUnassign = async (plantaId) => {
    const sensorId = getSensorAsignado(plantaId);
    if (!sensorId) return;

    if (!window.confirm('¿Desasignar esta planta del sensor?')) return;

    try {
      const result = await SensorAssignmentService.unassignPlantaFromSensor(sensorId);
      if (result.success) {
        alert('Planta desasignada exitosamente');
      } else {
        alert('Error al desasignar planta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al desasignar planta');
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Formulario enviado');
    console.log('📋 Datos del formulario:', formData);
    
    try {
      if (editingId) {
        // Actualizar planta
        const result = await onUpdatePlanta(editingId, formData);
        if (result.success) {
          console.log('✅ Planta actualizada');
          
          // Si la planta está asignada a un sensor, actualizar también la humedad_minima del sensor
          const sensorAsignado = getSensorAsignado(editingId);
          if (sensorAsignado) {
            console.log(`🔄 Sincronizando humedad con ${sensorAsignado}`);
            const syncResult = await SensorAssignmentService.assignPlantaToSensor(sensorAsignado, editingId);
            if (syncResult.success) {
              console.log('✅ Humedad del sensor actualizada');
              alert(`Planta actualizada y sincronizada con ${sensorAsignado.toUpperCase()}\n📊 Nueva humedad mínima: ${formData.humedad_minima_recomendada}%`);
            }
          }
          
          handleCancel();
        } else {
          console.error('Error al actualizar:', result.error);
          alert('Error al actualizar la planta: ' + (result.error?.message || 'Error desconocido'));
        }
      } else {
        // Crear (agregar fecha automática)
        const today = new Date().toISOString().split('T')[0];
        const dataWithDate = {
          ...formData,
          fecha_creacion: today
        };
        console.log('📤 Enviando datos para crear:', dataWithDate);
        
        const result = await onCreatePlanta(dataWithDate);
        console.log('📥 Resultado de crear:', result);
        
        if (result.success) {
          console.log('✅ Planta creada exitosamente');
          handleCancel();
        } else {
          console.error('❌ Error al crear:', result.error);
          alert('Error al crear la planta: ' + (result.error?.message || 'Error desconocido'));
        }
      }
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      alert('Error al guardar la planta: ' + error.message);
    }
  };

  // Editar planta
  const handleEdit = (planta) => {
    setFormData(planta.toFormData());
    setEditingId(planta.id);
    setShowForm(true);
  };

  // Eliminar planta
  const handleDelete = async (id) => {
    const result = await onDeletePlanta(id);
    if (result.success) {
      console.log('Planta eliminada');
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData(createEmptyPlanta().toFormData());
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="pt-6 pb-10">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">🌱 Gestión de Plantas</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>Nueva Planta</span>
            </button>
          )}
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6 mb-8 relative">
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
              title="Cerrar formulario"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-6 text-gray-800 pr-10">
              {editingId ? '✏️ Editar Planta' : '🌱 Agregar Nueva Planta'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Planta *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    placeholder="Ej: Alfalfa, Romero"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Humedad Mínima Recomendada (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.humedad_minima_recomendada}
                    onChange={(e) => setFormData({...formData, humedad_minima_recomendada: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    placeholder="Ej: 60"
                  />
                </div>
              </div>
              
              {editingId && formData.fecha_creacion && (
                <div className="text-sm text-gray-600 mt-2">
                  Fecha de creación: <span className="font-semibold">{formData.fecha_creacion}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {loading ? 'Guardando...' : editingId ? '✓ Actualizar' : '✓ Guardar'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Plantas */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading && plantas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Cargando plantas...</p>
            </div>
          ) : plantas.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-6xl mb-4">🌱</div>
              <p className="text-xl font-semibold mb-2">No hay plantas registradas</p>
              <p className="text-sm">Agrega tu primera planta usando el botón de arriba</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Humedad Mínima (%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Creación
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asignación
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plantas.map((planta) => {
                    const sensorAsignado = getSensorAsignado(planta.id);
                    const sensor1Ocupado = sensores.sensor1?.planta && sensores.sensor1.planta !== planta.id;
                    const sensor2Ocupado = sensores.sensor2?.planta && sensores.sensor2.planta !== planta.id;
                    
                    return (
                      <tr key={planta.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {planta.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {planta.humedad_minima_recomendada}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {planta.fecha_creacion || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          {sensorAsignado ? (
                            <div className="flex items-center justify-center gap-2">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                {sensorAsignado.toUpperCase()}
                              </span>
                              <button
                                onClick={() => handleUnassign(planta.id)}
                                className="text-red-600 hover:text-red-800 text-xs"
                                title="Desasignar"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleAssignToSensor(planta.id, 'sensor1')}
                                disabled={sensor1Ocupado}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                  sensor1Ocupado
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                                title={sensor1Ocupado ? 'Sensor 1 ya está ocupado' : 'Asignar a Sensor 1'}
                              >
                                Sensor 1
                              </button>
                              <button
                                onClick={() => handleAssignToSensor(planta.id, 'sensor2')}
                                disabled={sensor2Ocupado}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                  sensor2Ocupado
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-purple-500 text-white hover:bg-purple-600'
                                }`}
                                title={sensor2Ocupado ? 'Sensor 2 ya está ocupado' : 'Asignar a Sensor 2'}
                              >
                                Sensor 2
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => handleEdit(planta)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-all duration-200 mr-2"
                            title="Editar planta"
                          >
                            ✏️ Editar
                          </button>
                          {isPlantaAsignada(planta.id) ? (
                            <button
                              disabled
                              className="text-gray-400 bg-gray-100 px-3 py-1.5 rounded-md cursor-not-allowed opacity-60"
                              title="No se puede eliminar - Planta asignada a un sensor"
                            >
                              🔒 Asignada
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDelete(planta.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-md transition-all duration-200"
                              title="Eliminar planta"
                            >
                              🗑️ Eliminar
                            </button>
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

        {/* Estadísticas */}
        {plantas.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-2xl p-5 text-center shadow-lg border border-green-200 hover:shadow-xl transition-all duration-200">
              <p className="text-green-800 font-semibold text-lg">Total Plantas</p>
              <p className="text-4xl font-bold text-green-900 mt-2">{plantas.length}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-5 text-center shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-200">
              <p className="text-blue-800 font-semibold text-lg">Humedad Promedio</p>
              <p className="text-4xl font-bold text-blue-900 mt-2">
                {Math.round(plantas.reduce((acc, p) => acc + (p.humedad_minima_recomendada || 0), 0) / plantas.length)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantasView;
