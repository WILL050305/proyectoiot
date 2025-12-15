/**
 * SERVICIO: ConsumoAguaService
 * Calcula el consumo de agua basado en el historial de riegos
 */

import { database } from '../firebase/config';
import { ref, get } from 'firebase/database';

export class ConsumoAguaService {
  // Tasas de flujo de la bomba
  static TASA_LITROS_POR_MINUTO = 1.67;
  static TASA_ML_POR_SEGUNDO = 28;
  static TASA_LITROS_POR_SEGUNDO = 0.028;

  /**
   * Obtener todo el historial
   */
  static async getHistorial() {
    try {
      const historialRef = ref(database, 'historial');
      const snapshot = await get(historialRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convertir a array y ordenar por timestamp
        const historialArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        return { success: true, data: historialArray };
      }
      
      return { success: true, data: [] };
    } catch (error) {
      console.error('Error al obtener historial:', error);
      return { success: false, error };
    }
  }

  /**
   * Calcular consumo solo del día actual (00:00 - 23:59)
   */
  static async calcularConsumoHoy() {
    try {
      const result = await this.calcularConsumoTotal();
      if (!result.success) return result;

      const { periodos } = result.data;
      
      // Obtener inicio y fin del día actual
      const ahora = new Date();
      const inicioDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0);
      const finDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
      
      const timestampInicioDia = Math.floor(inicioDia.getTime() / 1000);
      const timestampFinDia = Math.floor(finDia.getTime() / 1000);

      // Filtrar solo periodos de hoy
      const periodosHoy = periodos.filter(periodo => 
        periodo.timestampInicio >= timestampInicioDia && 
        periodo.timestampInicio <= timestampFinDia
      );

      // Calcular consumo total de hoy
      const consumoHoy = periodosHoy.reduce((total, periodo) => total + periodo.consumoLitros, 0);

      return {
        success: true,
        data: {
          consumoLitros: Math.round(consumoHoy * 100) / 100,
          totalRiegos: periodosHoy.length,
          periodos: periodosHoy
        }
      };
    } catch (error) {
      console.error('Error al calcular consumo de hoy:', error);
      return { success: false, error };
    }
  }

  /**
   * Calcular periodos de riego (ON-OFF) y consumo total
   */
  static async calcularConsumoTotal() {
    try {
      const result = await this.getHistorial();
      if (!result.success || result.data.length === 0) {
        return { success: true, data: { periodos: [], consumoTotal: 0 } };
      }

      const historial = result.data;
      const periodos = [];
      const pendientes = {}; // sensor -> timestamp ON

      // Procesar cada evento
      for (const evento of historial) {
        const accion = evento.accion.toLowerCase();
        const sensor = evento.sensor;

        // Detectar eventos ON
        if (accion.includes('on') || accion.includes('riego automático on')) {
          pendientes[sensor] = {
            timestampInicio: evento.timestamp,
            fechaInicio: evento.fecha,
            accionInicio: evento.accion
          };
        }
        // Detectar eventos OFF
        else if (accion.includes('off')) {
          if (pendientes[sensor]) {
            const inicio = pendientes[sensor];
            const duracionSegundos = evento.timestamp - inicio.timestampInicio;
            const duracionMinutos = duracionSegundos / 60;
            const consumoLitros = duracionMinutos * this.TASA_LITROS_POR_MINUTO;

            periodos.push({
              sensor,
              fechaInicio: inicio.fechaInicio,
              fechaFin: evento.fecha,
              timestampInicio: inicio.timestampInicio,
              timestampFin: evento.timestamp,
              duracionSegundos,
              duracionMinutos: Math.round(duracionMinutos * 100) / 100,
              consumoLitros: Math.round(consumoLitros * 100) / 100,
              accionInicio: inicio.accionInicio,
              accionFin: evento.accion
            });

            delete pendientes[sensor];
          }
        }
      }

      // Calcular consumo total
      const consumoTotal = periodos.reduce((total, periodo) => total + periodo.consumoLitros, 0);

      return {
        success: true,
        data: {
          periodos,
          consumoTotal: Math.round(consumoTotal * 100) / 100,
          totalPeriodos: periodos.length
        }
      };
    } catch (error) {
      console.error('Error al calcular consumo:', error);
      return { success: false, error };
    }
  }

  /**
   * Calcular consumo por día
   */
  static async calcularConsumoPorDia() {
    try {
      const result = await this.calcularConsumoTotal();
      if (!result.success) return result;

      const { periodos } = result.data;
      const consumoPorDia = {};

      periodos.forEach(periodo => {
        // Extraer fecha (YYYY-MM-DD) del timestamp
        const fecha = new Date(periodo.timestampInicio * 1000).toISOString().split('T')[0];
        
        if (!consumoPorDia[fecha]) {
          consumoPorDia[fecha] = {
            fecha,
            consumoLitros: 0,
            totalRiegos: 0,
            periodos: []
          };
        }

        consumoPorDia[fecha].consumoLitros += periodo.consumoLitros;
        consumoPorDia[fecha].totalRiegos++;
        consumoPorDia[fecha].periodos.push(periodo);
      });

      // Convertir a array y ordenar por fecha
      const consumoArray = Object.values(consumoPorDia)
        .map(dia => ({
          ...dia,
          consumoLitros: Math.round(dia.consumoLitros * 100) / 100
        }))
        .sort((a, b) => b.fecha.localeCompare(a.fecha));

      return {
        success: true,
        data: consumoArray
      };
    } catch (error) {
      console.error('Error al calcular consumo por día:', error);
      return { success: false, error };
    }
  }

  /**
   * Calcular consumo por sensor
   */
  static async calcularConsumoPorSensor() {
    try {
      const result = await this.calcularConsumoTotal();
      if (!result.success) return result;

      const { periodos } = result.data;
      const consumoPorSensor = {};

      periodos.forEach(periodo => {
        if (!consumoPorSensor[periodo.sensor]) {
          consumoPorSensor[periodo.sensor] = {
            sensor: periodo.sensor,
            consumoLitros: 0,
            totalRiegos: 0,
            duracionTotalMinutos: 0
          };
        }

        consumoPorSensor[periodo.sensor].consumoLitros += periodo.consumoLitros;
        consumoPorSensor[periodo.sensor].totalRiegos++;
        consumoPorSensor[periodo.sensor].duracionTotalMinutos += periodo.duracionMinutos;
      });

      // Convertir a array
      const consumoArray = Object.values(consumoPorSensor).map(sensor => ({
        ...sensor,
        consumoLitros: Math.round(sensor.consumoLitros * 100) / 100,
        duracionTotalMinutos: Math.round(sensor.duracionTotalMinutos * 100) / 100
      }));

      return {
        success: true,
        data: consumoArray
      };
    } catch (error) {
      console.error('Error al calcular consumo por sensor:', error);
      return { success: false, error };
    }
  }
}
