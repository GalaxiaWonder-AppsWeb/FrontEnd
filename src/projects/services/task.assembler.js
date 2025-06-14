// src/projects/services/task.assembler.js
import { Task } from "../model/task.entity.js";
import { TaskStatus } from "../model/task-status.js";
import { Specialty } from "../model/specialty.js";

export class TaskAssembler {
    static toEntityFromResource(resource) {
        try {
            // Validar y convertir fechas
            const startingDate = resource.startingDate ? new Date(resource.startingDate) : new Date();
            const dueDate = resource.dueDate ? new Date(resource.dueDate) : new Date();
              // Validar specialty y status
            const specialty = Object.values(Specialty).includes(resource.specialty) 
                ? resource.specialty 
                : Specialty.ARCHITECTURE;
                
            const status = Object.values(TaskStatus).includes(resource.status) 
                ? resource.status 
                : TaskStatus.DRAFT;
              // Crear instancia de Task con los datos validados
            return new Task({
                id: typeof resource.id === 'number' ? resource.id : null,
                name: resource.name || 'New Task',
                specialty: specialty,
                status: status,
                startingDate: startingDate,
                dueDate: dueDate,
                responsible: resource.responsible || null,
                milestoneId: resource.milestoneId || null
            });
        } catch (error) {
            console.error("Error converting resource to Task entity:", error);
            // Devolver una tarea por defecto en caso de error
            return new Task({
                name: "Error Task",
                specialty: Specialty.GENERAL,
                status: TaskStatus.DRAFT,
                responsible: null
            });
        }
    }

    static toEntitiesFromResponse(resourceList) {
        if (!resourceList) return [];
        
        const list = Array.isArray(resourceList) ? resourceList : [resourceList];
        return list
            .map(item => {
                try {
                    return this.toEntityFromResource(item);
                } catch (e) {
                    console.error("Error converting task item:", e);
                    return null;
                }
            })
            .filter(item => item !== null); // Filtrar tareas que no se pudieron convertir
    }
    
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            name: entity.name,
            specialty: entity.specialty,
            status: entity.status,
            startingDate: entity.startingDate instanceof Date ? entity.startingDate.toISOString() : null,
            dueDate: entity.dueDate instanceof Date ? entity.dueDate.toISOString() : null,
            responsible: entity.responsible
        };
    }
}