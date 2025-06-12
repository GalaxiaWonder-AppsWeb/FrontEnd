import { BaseService } from "../../shared/services/base.service.js";

class PersonService extends BaseService {
    constructor() {
        super("/persons"); // El endpoint "persons" será utilizado como base
    }    
    async getById(personId) {
        try {
            const url = `${this.url}/${personId}`;
            console.log("URL construida en getById:", url);
            console.log(`GET request to URL ${this.url}/${personId}`);

            const response = await this.get(`${personId}`);
            console.log('FALLE ACA?', response);
            
            if (response && response.data) {
                return response.data;
            } else if (response) { 
                // Algunos servicios devuelven directamente los datos
                return response;
            }
            
            throw new Error('Person not found');
        } catch (error) {
            console.error('Error fetching person by ID:', error);
            throw error;
        }
    }
    
    update(personId, personData) {
        console.log(`Updating person with ID ${personId}:`, personData);
        return this.put(personId, personData);
    }
}

export const personService = new PersonService();
