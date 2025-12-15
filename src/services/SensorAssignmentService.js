/**
 * SERVICIO: SensorAssignmentService
 * Maneja la asignación de plantas a sensores en Firebase Realtime Database
 */

import { database } from '../firebase/config';
import { ref, update, get } from 'firebase/database';

export class SensorAssignmentService {
  /**
   * Asignar una planta a un sensor y actualizar la humedad mínima
   */
  static async assignPlantaToSensor(sensorId, plantaId) {
    try {
      console.log(`📌 Asignando planta "${plantaId}" al ${sensorId}`);
      
      // Primero obtenemos la información de la planta
      const plantaRef = ref(database, `plantas/${plantaId}`);
      const plantaSnapshot = await get(plantaRef);
      
      if (!plantaSnapshot.exists()) {
        console.error('❌ La planta no existe en la base de datos');
        return { success: false, error: 'Planta no encontrada' };
      }
      
      const plantaData = plantaSnapshot.val();
      const humedadMinima = plantaData.humedad_minima_recomendada;
      
      // Actualizamos el sensor con la planta Y la humedad mínima
      const sensorRef = ref(database, `sensores/${sensorId}`);
      await update(sensorRef, {
        planta: plantaId,
        humedad_minima: humedadMinima
      });
      
      console.log(`✅ Planta asignada exitosamente con humedad mínima: ${humedadMinima}%`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error al asignar planta:', error);
      return { success: false, error };
    }
  }

  /**
   * Desasignar una planta de un sensor
   */
  static async unassignPlantaFromSensor(sensorId) {
    try {
      console.log(`🔓 Desasignando planta del ${sensorId}`);
      
      const sensorRef = ref(database, `sensores/${sensorId}`);
      await update(sensorRef, {
        planta: null
      });
      
      console.log(`✅ Planta desasignada exitosamente`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error al desasignar planta:', error);
      return { success: false, error };
    }
  }
}

export default SensorAssignmentService;
