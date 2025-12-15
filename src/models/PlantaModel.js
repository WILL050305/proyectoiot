/**
 * MODELO: PlantaModel
 * Representa la estructura de datos de una planta
 */

export class PlantaModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.humedad_minima_recomendada = Number(data.humedad_minima_recomendada) || 0;
    this.fecha_creacion = data.fecha_creacion || '';
  }

  // Validar datos de la planta
  isValid() {
    const isValid = this.nombre.trim() !== '' && 
           this.humedad_minima_recomendada >= 0 && 
           this.humedad_minima_recomendada <= 100;
    
    console.log('🔍 Validando planta:', {
      nombre: this.nombre,
      humedad: this.humedad_minima_recomendada,
      fecha: this.fecha_creacion,
      isValid
    });
    
    return isValid;
  }

  toJSON() {
    return {
      nombre: this.nombre,
      humedad_minima_recomendada: Number(this.humedad_minima_recomendada),
      fecha_creacion: this.fecha_creacion
    };
  }

  toFormData() {
    return {
      nombre: this.nombre,
      humedad_minima_recomendada: this.humedad_minima_recomendada,
      fecha_creacion: this.fecha_creacion
    };
  }
}

export default PlantaModel;
