/**
 * MODELO: GraficoModel
 * Representa un punto de datos para el gráfico
 */

export class GraficoModel {
  constructor(data = {}) {
    this.humedad1 = data.humedad1 || 0;
    this.humedad2 = data.humedad2 || 0;
    this.timestamp = data.timestamp || Date.now();
  }

  // Obtener hora formateada
  getHoraFormateada() {
    return new Date(this.timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  toJSON() {
    return {
      humedad1: this.humedad1,
      humedad2: this.humedad2,
      timestamp: this.timestamp
    };
  }
}

export default GraficoModel;
