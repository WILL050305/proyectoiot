/**
 * MODELO: SensorModel
 * Representa la estructura de datos de un sensor
 */

export class SensorModel {
  constructor(data = {}) {
    this.humedad = data.humedad || 0;
    this.planta = data.planta || '';
    this.fecha = data.fecha || new Date().toISOString();
    this.rele_estado = data.rele_estado !== undefined ? data.rele_estado : 1;
  }

  // Métodos del modelo
  estaRiegoActivo() {
    // Relé activo en LOW: 0 = encendido, 1 = apagado
    return this.rele_estado === 0;
  }

  estaOnline(segundosMaximo = 15) {
    if (!this.fecha) return false;
    const sensorTime = new Date(this.fecha).getTime();
    const now = Date.now();
    return (now - sensorTime) < (segundosMaximo * 1000);
  }

  toJSON() {
    return {
      humedad: this.humedad,
      planta: this.planta,
      fecha: this.fecha,
      rele_estado: this.rele_estado
    };
  }
}

export default SensorModel;
