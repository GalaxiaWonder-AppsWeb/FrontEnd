import {OrganizationMemberId} from '../../shared/model/organization-member-id.js'
import {ProjectRole} from "./project-role.js";
import {Specialty} from "./specialty.js";

export class ProjectTeamMember {
    constructor({
                    id = new ProjectTeamMemberId(),
                    role,
                    specialty,
                    memberId = new OrganizationMemberId()
                } = {}) {
        if (!(id instanceof ProjectTeamMemberId)) {
            throw new Error('Id must be a valid ProjectTeamMemberId instance.');
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

        if (!(memberId instanceof OrganizationMemberId) || !memberId.value) {
            throw new Error('MemberId must be a valid OrganizationMemberId instance with a value.');
        }

        this.id = id;
        this.role = role; // Esperando a que definas ProjectRole o lo que corresponda
        this.specialty = specialty || null; // Esperando definición de Specialty
        this.memberId = memberId;
    }

    toJSON() {
        console.log('Valor de this.id antes de serializar:', this.id);
        return {
            id: this.id.value,
            role: this.role,
            specialty: this.specialty,
            memberId: this.memberId.value
        };
    }
}

export class ProjectTeamMemberId {
    constructor(value) {
        this.value = value || crypto.randomUUID();
    }

    toJSON() {
        return {
            value: this.value
        };
    }
}
