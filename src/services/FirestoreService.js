/**
 * SERVICIO: FirestoreService (Usando Realtime Database)
 * Maneja todas las operaciones con Firebase Realtime Database (CRUD de plantas)
 */

import { database } from '../firebase/config';
import { 
  ref,
  set,
  get,
  update,
  remove,
  push
} from 'firebase/database';
import { PlantaModel } from '../models/PlantaModel';

export class FirestoreService {
  static COLLECTION_NAME = 'plantas';

  /**
   * Obtener todas las plantas
   */
  static async getPlantas() {
    try {
      const plantasRef = ref(database, this.COLLECTION_NAME);
      const snapshot = await get(plantasRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const plantas = Object.keys(data).map(key => {
          const model = new PlantaModel({ id: key, ...data[key] });
          return model;
        });
        return { success: true, data: plantas };
      } else {
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error('Error al obtener plantas:', error);
      return { success: false, error };
    }
  }

  /**
   * Crear una nueva planta
   */
  static async createPlanta(plantaData) {
    try {
      console.log('📝 Datos recibidos para crear planta:', plantaData);
      
      // Convertir humedad a número
      const dataConvertida = {
        ...plantaData,
        humedad_minima_recomendada: Number(plantaData.humedad_minima_recomendada)
      };
      
      const planta = new PlantaModel(dataConvertida);
      console.log('📦 Modelo de planta creado:', planta);
      
      if (!planta.isValid()) {
        console.error('❌ Validación fallida:', {
          nombre: planta.nombre,
          humedad: planta.humedad_minima_recomendada,
          fecha: planta.fecha_creacion
        });
        throw new Error('Datos de planta inválidos');
      }

      // Usar el nombre en minúsculas como ID (igual que tu BD.json)
      const plantaId = plantaData.nombre.toLowerCase().replace(/\s+/g, '');
      const plantaRef = ref(database, `${this.COLLECTION_NAME}/${plantaId}`);
      
      const dataToSave = planta.toJSON();
      console.log('💾 Guardando en Firebase:', { path: `${this.COLLECTION_NAME}/${plantaId}`, data: dataToSave });
      
      await set(plantaRef, dataToSave);
      console.log('✅ Planta creada con ID:', plantaId);
      
      return { success: true, id: plantaId };
    } catch (error) {
      console.error('❌ Error al crear planta:', error);
      return { success: false, error };
    }
  }

  /**
   * Actualizar una planta existente
   */
  static async updatePlanta(plantaId, plantaData) {
    try {
      const planta = new PlantaModel(plantaData);
      
      if (!planta.isValid()) {
        throw new Error('Datos de planta inválidos');
      }

      const plantaRef = ref(database, `${this.COLLECTION_NAME}/${plantaId}`);
      await update(plantaRef, planta.toFormData());
      console.log('✅ Planta actualizada:', plantaId);
      
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar planta:', error);
      return { success: false, error };
    }
  }

  /**
   * Eliminar una planta
   */
  static async deletePlanta(plantaId) {
    try {
      const plantaRef = ref(database, `${this.COLLECTION_NAME}/${plantaId}`);
      await remove(plantaRef);
      console.log('✅ Planta eliminada:', plantaId);
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar planta:', error);
      return { success: false, error };
    }
  }
}

export default FirestoreService;
