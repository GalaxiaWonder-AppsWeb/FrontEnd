/**
 * Utilidad para medir el rendimiento de operaciones críticas
 */
export class PerformanceMonitor {
  static measurements = {};
  
  /**
   * Inicia la medición de una operación
   * @param {string} operationName - Nombre de la operación a medir
   */
  static startMeasure(operationName) {
    if (!operationName) return;
    this.measurements[operationName] = {
      start: performance.now(),
      end: null,
      duration: null
    };
    console.log(`🕒 Iniciando medición para: ${operationName}`);
  }
  
  /**
   * Finaliza la medición de una operación y muestra el resultado
   * @param {string} operationName - Nombre de la operación a finalizar
   * @returns {number|null} - Duración en milisegundos o null si no existe la medición
   */
  static endMeasure(operationName) {
    if (!operationName || !this.measurements[operationName]) return null;
    
    const measurement = this.measurements[operationName];
    measurement.end = performance.now();
    measurement.duration = measurement.end - measurement.start;
    
    console.log(`⏱️ ${operationName}: ${measurement.duration.toFixed(2)} ms`);
    return measurement.duration;
  }
  
  /**
   * Mide el tiempo de ejecución de una función
   * @param {string} operationName - Nombre de la operación
   * @param {Function} fn - Función a ejecutar
   * @param {Array} args - Argumentos para la función
   * @returns {any} - Resultado de la función
   */
  static async measureAsync(operationName, fn, ...args) {
    this.startMeasure(operationName);
    try {
      return await fn(...args);
    } finally {
      this.endMeasure(operationName);
    }
  }
  
  /**
   * Obtiene un informe de todas las mediciones realizadas
   * @returns {Object} - Informe de rendimiento
   */
  static getReport() {
    const report = {
      measurements: { ...this.measurements },
      summary: {
        totalOperations: Object.keys(this.measurements).length,
        totalTime: 0,
        averageTime: 0,
        slowestOperation: { name: null, time: 0 },
        fastestOperation: { name: null, time: Infinity }
      }
    };
    
    // Calcular métricas
    for (const [opName, data] of Object.entries(this.measurements)) {
      if (data.duration !== null) {
        report.summary.totalTime += data.duration;
        
        if (data.duration > report.summary.slowestOperation.time) {
          report.summary.slowestOperation = { name: opName, time: data.duration };
        }
        
        if (data.duration < report.summary.fastestOperation.time) {
          report.summary.fastestOperation = { name: opName, time: data.duration };
        }
      }
    }
    
    if (report.summary.totalOperations > 0) {
      report.summary.averageTime = report.summary.totalTime / report.summary.totalOperations;
    }
    
    return report;
  }
  
  /**
   * Limpia todas las mediciones
   */
  static clearMeasurements() {
    this.measurements = {};
  }
}
