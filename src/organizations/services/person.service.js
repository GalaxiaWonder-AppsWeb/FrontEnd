import { BaseService } from "../../shared/services/base.service.js";

class PersonService extends BaseService {
    constructor() {
        super("/persons"); // El endpoint "persons" será utilizado como base
    }    // Método para obtener una persona por su ID
    async getById(personId) {
        try {
            console.log(`Obteniendo persona con id ${personId}`);
            if (!personId) {
                console.warn('ID de persona no proporcionado');
                return null;
            }

            // Asegurar que personId sea tratado como string si es número
            const id = personId.toString();
            
            // Intentar obtener usando el servicio base
            try {
                const response = await this.get(id);
                
                // Si la respuesta tiene la propiedad data, extraer los datos
                if (response && response.data) {
                    console.log(`Persona obtenida:`, response.data);
                    return response.data;
                }
                
                // Si la respuesta ya es el objeto directo
                if (response && typeof response === 'object' && response.id) {
                    console.log(`Persona obtenida directamente:`, response);
                    return response;
                }
                
                // Caso especial: si la API devuelve un array (puede suceder con json-server)
                if (response && Array.isArray(response)) {
                    console.log(`API devolvió array, buscando persona con id ${personId}`);
                    const person = response.find(p => p.id.toString() === id);
                    if (person) {
                        console.log(`Persona encontrada en array:`, person);
                        return person;
                    }
                }
            } catch (error) {
                console.warn(`Error al obtener persona con get() para id ${personId}:`, error);
                // Si hay un error, intentamos un fallback
            }
            
            // Fallback: Intentar con fetch directo a la API
            try {
                console.log(`Intentando fetch directo para persona con id ${personId}`);
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
                    console.log(`Persona obtenida con fetch directo:`, data);
                    return data;
                }
            } catch (fetchError) {
                console.warn(`Error en fetch directo para persona con id ${personId}:`, fetchError);
            }
            
            // Último recurso: Intentar obtener todas las personas y filtrar
            try {
                console.log(`Intentando obtener todas las personas y filtrar para id ${personId}`);
                const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
                const response = await fetch(`${apiUrl}/persons`);
                
                if (response.ok) {
                    const allPersons = await response.json();
                    const person = allPersons.find(p => p.id.toString() === id);
                    if (person) {
                        console.log(`Persona encontrada en listado completo:`, person);
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

    // Método para buscar trabajadores por término de búsqueda (nombre o email)
    searchWorkers(query) {
        const url = `${this.url}/search/workers?query=${encodeURIComponent(query)}`;
        console.log(`Searching workers with query: ${query}`);
        return this.http.get(url)
            .then(response => response.data)
            .catch(error => {
                console.error("Error searching workers:", error);
                throw error;
            });
    }

    // Método para buscar personas por email
    searchByEmail(email) {
        const url = `${this.url}/search?email=${encodeURIComponent(email)}`;
        console.log(`Searching person with email: ${email}`);
        return this.http.get(url)
            .then(response => response.data)
            .catch(error => {
                console.error("Error searching by email:", error);
                throw error;
            });
    }
}

// Exportar una instancia del servicio para usarlo en cualquier lugar
export const personService = new PersonService();