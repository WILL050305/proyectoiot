/**
 * SERVICIO: FirebaseService
 * Maneja todas las operaciones con Firebase Realtime Database
 */

import { database } from '../firebase/config';
import { ref, onValue, update } from 'firebase/database';
import { SensorModel } from '../models/SensorModel';
import { HistorialModel } from '../models/HistorialModel';

export class FirebaseService {
  /**
   * Suscribirse a cambios en los sensores
   */
  static onSensoresChange(callback) {
    const sensoresRef = ref(database, 'sensores');
    
    const unsubscribe = onValue(sensoresRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📊 Datos recibidos de Firebase:', data);
      
      if (data) {
        // Convertir datos a modelos
        const sensoresModels = {
          sensor1: data.sensor1 ? new SensorModel(data.sensor1) : null,
          sensor2: data.sensor2 ? new SensorModel(data.sensor2) : null
        };
        
        callback(sensoresModels, null);
      } else {
        console.warn('⚠️ No hay datos en Firebase');
        callback(null, new Error('No hay datos disponibles'));
      }
    }, (error) => {
      console.error('❌ Error al conectar con Firebase:', error);
      callback(null, error);
    });

    return unsubscribe;
  }

  /**
   * Suscribirse a cambios en plantas
   */
  static onPlantasChange(callback) {
    const plantasRef = ref(database, 'plantas');
    
    const unsubscribe = onValue(plantasRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {}, null);
    }, (error) => {
      console.error('❌ Error al obtener plantas:', error);
      callback(null, error);
    });

    return unsubscribe;
  }

  /**
   * Suscribirse a cambios en historial
   */
  static onHistorialChange(callback) {
    const historialRef = ref(database, 'historial');
    
    const unsubscribe = onValue(historialRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // Convertir a modelos y filtrar válidos
        const historialArray = Object.values(data)
          .map(item => new HistorialModel(item))
          .filter(item => item.isValid())
          .sort((a, b) => a.timestamp - b.timestamp);
        
        callback(historialArray, null);
      } else {
        callback([], null);
      }
    }, (error) => {
      console.error('❌ Error al obtener historial:', error);
      callback(null, error);
    });

    return unsubscribe;
  }

  /**
   * Actualizar estado del relé
   */
  static async updateReleEstado(sensorId, nuevoEstado) {
    try {
      const updates = {};
      updates[`sensores/${sensorId}/rele_estado`] = nuevoEstado;
      
      await update(ref(database), updates);
      console.log(`✅ Relé ${sensorId} actualizado a:`, nuevoEstado);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error al actualizar relé:', error);
      return { success: false, error };
    }
  }
}

export default FirebaseService;
