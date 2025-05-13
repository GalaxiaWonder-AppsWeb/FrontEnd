import { BaseService } from "../../shared/services/base.service.js";

class PersonService extends BaseService {
    constructor() {
        super("/persons"); // El endpoint "persons" será utilizado como base
    }

    getById(personId) {
        const url = ${this.url}/${personId};
        console.log("URL construida en getById:", url); // Agregar log para verificar URL
        console.log(GET request to URL ${this.url}/${personId});
        return this.get(personId); // Ejecuta un GET
    }
}

export const personService = new PersonService();
