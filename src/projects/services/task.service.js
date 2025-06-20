// src/projects/services/task.service.js
import { createService } from '../../shared/services/create.service.js';
import { HttpVerb } from '../../shared/services/http-verb.js';
import { TaskAssembler } from './task.assembler.js';
import { TaskStatus } from '../model/task-status.js';

// Importamos BaseService para extender con el método getByMilestoneId personalizado
import { BaseService } from '../../shared/services/base.service.js';

// Creamos una clase extendida para manejar la obtención de tareas por milestoneId
class TaskService extends BaseService {
    constructor() {
        super('/tasks');
    }
      async getByMilestoneId(milestoneId) {
        try {
            // Usamos el método get heredado de BaseService con parámetros de consulta
            const response = await this.get('', { milestoneId: milestoneId });
            return TaskAssembler.toEntitiesFromResponse(response.data);
        } catch (error) {
            console.error(`Error fetching tasks for milestone ${milestoneId}:`, error);
            throw error;
        }
    }

    // Método para asignar un responsable a la tarea y actualizar su estado
    async assignResponsible(taskId, responsibleId) {
        try {
            if (!taskId) {
                throw new Error('Task ID is required');
            }
            
            if (!responsibleId) {
                throw new Error('Responsible ID is required');
            }
            
            // Primero obtenemos la tarea actual
            const taskResponse = await this.get(`${taskId}`);
            if (!taskResponse.data) {
                throw new Error(`Task with ID ${taskId} not found`);
            }
            
            // Creamos el objeto actualizado con el nuevo responsable y estado PENDING
            const updatedTask = {
                ...taskResponse.data,
                responsible: responsibleId,
                status: TaskStatus.PENDING
            };
            
            // Actualizamos la tarea
            const response = await this.put(`${taskId}`, updatedTask);
            return TaskAssembler.toEntityFromResource(response.data);
        } catch (error) {
            console.error(`Error assigning responsible to task ${taskId}:`, error);
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
        delete: { verb: HttpVerb.DELETE, path: ':id' }
    }, TaskAssembler),
    
    // Agregamos los métodos personalizados
    getByMilestoneId: (milestoneId) => taskServiceInstance.getByMilestoneId(milestoneId),
    assignResponsible: (taskId, responsibleId) => taskServiceInstance.assignResponsible(taskId, responsibleId)
};