import { BaseService } from "./base.service.js";

/**
 * Servicio consolidado para la gestión de personas
 * Combina las funcionalidades de los servicios de los directorios IAM y Organizations
 */
class PersonService extends BaseService {
    constructor() {
        super("/persons");
        }
    
    /**
     * Obtiene una persona por su ID con manejo de errores robusto
     * @param {number|string} personId - ID de la persona a buscar
     * @returns {Promise<Object|null>} - Datos de la persona o null
     */
    async getById(personId) {
        try {
            if (!personId && personId !== 0) {
                console.warn('ID de persona no proporcionado');
                return null;
            }

            // Asegurar que personId sea tratado como string si es número
            const id = personId.toString();

            // Intentar obtener usando el servicio base
            try {
                const response = await this.get(id);
                return response.data
                
                // Si la respuesta tiene la propiedad data, extraer los datos
                if (response && response.data) {
                    return response.data;
                }
                
                // Si la respuesta ya es el objeto directo
                if (response && typeof response === 'object' && response.id) {
                    return response;
                }
                
                // Caso especial: si la API devuelve un array (puede suceder con json-server)
                if (response && Array.isArray(response)) {
                    const person = response.find(p => p.id.toString() === id);
                    if (person) {
                        return person;
                    }
                }
            } catch (error) {
                console.warn(`Error al obtener persona con get() para id ${personId}:`, error);
                // Si hay un error, intentamos un fallback
            }
            //
            //
            //

            // Fallback: Intentar con fetch directo a la API
            try {
                const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
                
                // Intentar primero con la ruta de API
                let response = await fetch(`${apiUrl}/persons/${id}`);
                
                // Si no funciona, intentar sin prefijo /api/v1
                if (!response.ok && apiUrl.includes('/api/v1')) {
                    const alternativeUrl = apiUrl.replace('/api/v1', '');
                    response = await fetch(`${alternativeUrl}/persons/${id}`);
                }
                
                if (response.ok) {
                    const data = await response.json();
                    return data;
                }
            } catch (fetchError) {
                console.warn(`Error en fetch directo para persona con id ${personId}:`, fetchError);
            }

            // Último recurso: Intentar obtener todas las personas y filtrar
            try {
                const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
                const response = await fetch(`${apiUrl}/persons`);
                
                if (response.ok) {
                    const allPersons = await response.json();
                    const person = allPersons.find(p => p.id.toString() === id);
                    if (person) {
                        return person;
                    }
                }
            } catch (allError) {
                console.warn(`Error al obtener todas las personas para filtrar id ${personId}:`, allError);
            }

            
            console.warn(`No se pudo obtener persona con id ${personId} después de múltiples intentos`);
            return null;
        } catch (error) {
            console.error(`Error general al obtener persona con id ${personId}:`, error);
            return null;
        }
    }

    /**
     * Actualiza los datos de una persona
     * @param {number|string} personId - ID de la persona
     * @param {Object} personData - Datos actualizados de la persona
     * @returns {Promise} - Respuesta de la actualización
     */
    update(personId, personData) {
        return this.put(personId, personData);
    }

    /**
     * Busca trabajadores por término de búsqueda (nombre o email)
     * @param {string} query - Término de búsqueda
     * @returns {Promise<Array>} - Resultados de la búsqueda
     */
    searchWorkers(query) {
        const url = `${this.url}/search/workers?query=${encodeURIComponent(query)}`;
        return this.http.get(url)
            .then(response => response.data)
            .catch(error => {
                console.error("Error searching workers:", error);
                throw error;
            });
    }
    
    /**
     * Busca personas por email
     * @param {string} email - Email a buscar
     * @returns {Promise<Array>} - Resultados de la búsqueda
     */
    async searchByEmail(email) {
        if (!email) {
            console.warn('Email no proporcionado');
            return [];
        }
        
        try {
            // Intentar con filtrado de la API Rest
            const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/persons?email=${encodeURIComponent(email)}`);
            
            if (response.ok) {
                const data = await response.json();
                return data; // La API devuelve un array de resultados
            }
            
            // Si no hay resultados, devolver array vacío
            return [];
        } catch (error) {
            console.error("Error searching by email:", error);
            // No relanzo el error para simplificar el manejo en el componente
            return [];
        }
    }
}

// Exportar una instancia única del servicio para usar en toda la aplicación
export const personService = new PersonService();
