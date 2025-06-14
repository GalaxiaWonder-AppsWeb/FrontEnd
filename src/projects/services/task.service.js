// src/projects/services/task.service.js
import { createService } from '../../shared/services/create.service.js';
import { HttpVerb } from '../../shared/services/http-verb.js';
import { TaskAssembler } from './task.assembler.js';

// Importamos BaseService para extender con el método getByMilestoneId personalizado
import { BaseService } from '../../shared/services/base.service.js';

// Creamos una clase extendida para manejar la obtención de tareas por milestoneId
class TaskService extends BaseService {
    constructor() {
        super('/tasks');
    }
      async getByMilestoneId(milestoneId) {
        try {
            console.log(`Getting tasks for milestone ID: ${milestoneId}`);
            // Usamos el método get heredado de BaseService con parámetros de consulta
            const response = await this.get('', { milestoneId: milestoneId });
            console.log('Response from GET tasks by milestoneId:', response.data);
            return TaskAssembler.toEntitiesFromResponse(response.data);
        } catch (error) {
            console.error(`Error fetching tasks for milestone ${milestoneId}:`, error);
            throw error;
        }
    }
}

// Instancia del servicio personalizado
const taskServiceInstance = new TaskService();

export const taskService = {
    ...createService('/tasks', {
        getAll: { verb: HttpVerb.GET },
        getById: { verb: HttpVerb.GET, path: ':id' },
        create: { verb: HttpVerb.POST },
        update: { verb: HttpVerb.PUT, path: ':id' },
        delete: { verb: HttpVerb.DELETE, path: ':id' },
        assignResponsible: { verb: HttpVerb.PUT, path: ':id/responsible' },
        updateStatus: { verb: HttpVerb.PUT, path: ':id/status' }
    }, TaskAssembler),
    
    // Agregamos el método personalizado
    getByMilestoneId: (milestoneId) => taskServiceInstance.getByMilestoneId(milestoneId)
};