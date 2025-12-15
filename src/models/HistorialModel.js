/**
 * MODELO: HistorialModel
 * Representa un punto de datos histórico
 */

export class HistorialModel {
  constructor(data = {}) {
    this.timestamp = data.timestamp || Date.now();
    this.sensor = data.sensor || '';
    this.humedad = data.humedad || 0;
    this.accion = data.accion || '';
  }

  // Validar que el timestamp es válido
  isValid() {
    return this.timestamp > 1700000000; // Fecha mínima razonable
  }

  // Formatear fecha
  getFechaFormateada() {
    return new Date(this.timestamp).toLocaleString('es-ES');
  }

  toJSON() {
    return {
      timestamp: this.timestamp,
      sensor: this.sensor,
      humedad: this.humedad,
      accion: this.accion
    };
  }
}

export default HistorialModel;
