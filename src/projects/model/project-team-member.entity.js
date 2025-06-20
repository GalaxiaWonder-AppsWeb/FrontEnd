import {ProjectRole} from "./project-role.js";
import {Specialty} from "./specialty.js";

export class ProjectTeamMember {
    constructor({
                    id = null,
                    role,
                    specialty,
                    organizationMemberId = null,
                    projectId = null
                } = {}) {
        if (typeof id !== 'number' && id !== null) {
            throw new Error('id must be a number or null.');
        }

        if (typeof projectId !== 'number' && projectId !== null) {
            throw new Error('projectId must be a number or null.');
        }

        if (!Object.values(ProjectRole).includes(role)) {
            throw new Error(`Role must be one of the valid ProjectRole values: ${Object.values(ProjectRole).join(', ')}`);
        }

        // Validación condicional basada en el rol
        if (role === ProjectRole.SPECIALIST) {
            if (!specialty) {
                throw new Error('Specialty is required for a Specialist role.');
            }
            // Valida que el specialty sea uno de los valores permitidos en Specialty
            if (!Object.values(Specialty).includes(specialty)) {
                throw new Error(`Specialty must be one of the valid Specialty values: ${Object.values(Specialty).join(', ')}`);
            }
        } else {
            // Si no es Specialist, specialty debe ser null
            if (specialty) {
                throw new Error('Specialty is only required for the Specialist role.');
            }
        }

        if (!ProjectRole || !Specialty) {
            throw new Error('Missing required enums: ProjectRole or Specialty.');
        }


        if (typeof organizationMemberId !== 'number') {
                throw new Error('organizationMemberId must be a numeric value.');
        }

        this.id = id;
        this.role = role; // Esperando a que definas ProjectRole o lo que corresponda
        this.specialty = specialty || null; // Esperando definición de Specialty
        this.organizationMemberId = organizationMemberId;
        this.projectId = projectId || null; // Asegurando que projectId sea un número o null
    }

    toJSON() {
        return {
            id: this.id,
            role: this.role,
            specialty: this.specialty,
            organizationMemberId: this.organizationMemberId,
            projectId: this.projectId
        };
    }
}
