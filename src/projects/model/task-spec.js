import {ProjectTeamMemberId} from "./project-team-member.entity.js";
import {Specialty} from "./specialty.js";

export class TaskSpec {
    constructor({
                    name = '',
                    specialty,
                    responsible = new ProjectTeamMemberId(),
                    dueDate = new Date(),
                }) {

        if (!name || typeof name !== 'string') {
            throw new Error('Name is required and must be a non-empty string');
        }

        if (!Object.values(Specialty).includes(specialty)) {
            throw new Error(`Specialty must be one of the valid Specialty values: ${Object.values(Specialty).join(', ')}`);
        }

        if (!(responsible instanceof ProjectTeamMemberId) || !responsible.value) {
            throw new Error('Responsible must be a valid ProjectTeamMemberId instance with a value');
        }

        this.name = name;
        this.specialty = specialty;
        this.responsible = responsible;
        this.dueDate = dueDate;
    }

    toJSON() {
        return {
            name: this.name,
            specialty: this.specialty,
            responsible: this.responsible,
            dueDate: this.dueDate,
        };
    }
}