import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const Plantas = () => {
  const [plantas, setPlantas] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_creacion: '',
    humedad_minima_recomendada: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Leer plantas desde Firebase
  const fetchPlantas = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'plantas'));
      const plantasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlantas(plantasData);
    } catch (error) {
      console.error('Error al obtener plantas:', error);
    }
  };

  useEffect(() => {
    fetchPlantas();
  }, []);

  // Crear o actualizar planta
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Actualizar (mantener fecha original)
        const plantaRef = doc(db, 'plantas', editingId);
        await updateDoc(plantaRef, formData);
        console.log('Planta actualizada');
      } else {
        // Crear (agregar fecha automática)
        const today = new Date().toISOString().split('T')[0];
        await addDoc(collection(db, 'plantas'), {
          ...formData,
          fecha_creacion: today
        });
        console.log('Planta creada');
      }
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        fecha_creacion: '',
        humedad_minima_recomendada: ''
      });
      setEditingId(null);
      setShowForm(false);
      fetchPlantas();
    } catch (error) {
      console.error('Error al guardar planta:', error);
    }
  };

  // Editar planta
  const handleEdit = (planta) => {
    setFormData({
      nombre: planta.nombre,
      fecha_creacion: planta.fecha_creacion,
      humedad_minima_recomendada: planta.humedad_minima_recomendada
    });
    setEditingId(planta.id);
    setShowForm(true);
  };

  // Eliminar planta
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta planta?')) {
      try {
        await deleteDoc(doc(db, 'plantas', id));
        console.log('Planta eliminada');
        fetchPlantas();
      } catch (error) {
        console.error('Error al eliminar planta:', error);
      }
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData({
      nombre: '',
      fecha_creacion: '',
      humedad_minima_recomendada: ''
    });
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
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {editingId ? '✓ Actualizar' : '✓ Guardar'}
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
          {plantas.length === 0 ? (
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
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plantas.map((planta) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleEdit(planta)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-all duration-200 mr-2"
                          title="Editar planta"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(planta.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-md transition-all duration-200"
                          title="Eliminar planta"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
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

export default Plantas;
