import { Task } from './task.entity.js';

export class TaskFactory {
    static create(spec) {
        return new Task({
            name: spec.name,
            specialty: spec.specialty,
            startingDate: spec.startingDate,
            dueDate: spec.dueDate,
            responsible: spec.responsible,
        });
    }
}
