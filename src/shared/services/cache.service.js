// Simple cache utility to reduce API calls
export class CacheService {
  static cache = new Map();
  static cacheTTL = 60000; // 1 minuto por defecto
  
  /**
   * Obtiene datos de la caché o de la función provista
   * @param {string} key - Clave única para los datos
   * @param {function} fetchFunction - Función que devuelve una Promise para obtener los datos
   * @param {number} ttl - Tiempo de vida de la caché en ms (opcional)
   * @returns {Promise<any>} - Los datos, de la caché o frescos
   */
  static async getData(key, fetchFunction, ttl = null) {
    const cacheEntry = this.cache.get(key);
    const now = Date.now();
    
    if (cacheEntry && now - cacheEntry.timestamp < (ttl || this.cacheTTL)) {
      console.log(`Usando datos en caché para: ${key}`);
      return cacheEntry.data;
    }
    
    try {
      console.log(`Obteniendo datos frescos para: ${key}`);
      const data = await fetchFunction();
      this.cache.set(key, {
        data,
        timestamp: now
      });
      return data;
    } catch (error) {
      console.error(`Error obteniendo datos para ${key}:`, error);
      // Si hay error y tenemos datos en caché (incluso expirados), los usamos como fallback
      if (cacheEntry) {
        console.log(`Usando caché expirada como fallback para: ${key}`);
        return cacheEntry.data;
      }
      throw error;
    }
  }
  
  /**
   * Invalida una entrada de la caché
   * @param {string} key - Clave de la entrada a invalidar
   */
  static invalidate(key) {
    if (this.cache.has(key)) {
      console.log(`Invalidando caché para: ${key}`);
      this.cache.delete(key);
    }
  }
  
  /**
   * Invalida todas las entradas de la caché
   */
  static invalidateAll() {
    console.log('Invalidando toda la caché');
    this.cache.clear();
  }
}
