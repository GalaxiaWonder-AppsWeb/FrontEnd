import {OrganizationMemberId} from '../../shared/model/organization-member-id.js'

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

        if (!role) {
            throw new Error('Role is required.');
        }

        if (!specialty) {
            throw new Error('Specialty is required.');
        }

        if (!(memberId instanceof OrganizationMemberId) || !memberId.value) {
            throw new Error('MemberId must be a valid OrganizationMemberId instance with a value.');
        }

        this.id = id;
        this.role = role; // Esperando a que definas ProjectRole o lo que corresponda
        this.specialty = specialty; // Esperando definición de Specialty
        this.memberId = memberId;
    }

    toJSON() {
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
