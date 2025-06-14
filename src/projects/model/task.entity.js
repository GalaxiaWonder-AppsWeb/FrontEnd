import {Specialty} from "./specialty.js";
import {TaskStatus} from "./task-status.js";
import {TaskSubmission} from "./task-submission.entity.js";
import {ScheduleItem} from "./schedule-item.js";

export class Task extends ScheduleItem {    constructor({
                    id = null,
                    name = '',
                    specialty,
                    status = TaskStatus.DRAFT,
                    startingDate = new Date(),
                    dueDate = new Date(),
                    //submission = new TaskSubmission(),
                    responsible = null,
                    milestoneId = null,
                }) {

        super();

        if (!name || typeof name !== 'string') {
            throw new Error('Name is required and must be a non-empty string');
        }

        if (!Object.values(Specialty).includes(specialty)) {
            throw new Error(`Specialty must be one of the valid Specialty values: ${Object.values(Specialty).join(', ')}`);
        }

        if (!Object.values(TaskStatus).includes(status)) {
            throw new Error(`Status must be one of the valid TaskStatus values: ${Object.values(TaskStatus).join(', ')}`);
        }

        if (!(startingDate instanceof Date) || isNaN(startingDate)) {
            throw new Error('Starting date must be a valid Date object');
        }

        if (!(dueDate instanceof Date) || isNaN(dueDate)) {
            throw new Error('Due date must be a valid Date object');
        }

        if (dueDate < startingDate) {
            throw new Error('Due date cannot be earlier than starting date');
        }        // El responsible puede ser null para tareas nuevas
        if (responsible !== null && typeof responsible !== 'number') {
            throw new Error('Responsible must be null or a number');
        }

        this.id = typeof id === 'number' ? id : null;
        this.name = name;
        this.specialty = specialty;
        this.status = status;        this.startingDate = startingDate;
        this.dueDate = dueDate;
        //this.submission = submission;
        this.responsible = typeof responsible === 'number' ? responsible : null;
        this.milestoneId = milestoneId;
    }

    getStartingDate() {
        return this.startingDate;
    }

    getDueDate() {
        return this.dueDate;
    }

    assignResponsible(responsible) {
        if (typeof responsible !== 'number') {
            throw new Error('Responsible must be a valid number');
        }
        this.responsible = responsible;
    }

    updateStatus(newStatus) {
        if (!Object.values(TaskStatus).includes(newStatus)) {
            throw new Error(`Status must be one of the valid TaskStatus values: ${Object.values(TaskStatus).join(', ')}`);
        }
        this.status = newStatus;
    }    toJSON() {
        return {
            id: this.id,
            name: this.name,
            specialty: this.specialty,
            status: this.status,
            startingDate: this.startingDate,
            dueDate: this.dueDate,
            //submission: this.submission,
            responsible: this.responsible,
            milestoneId: this.milestoneId
        };
    }
}