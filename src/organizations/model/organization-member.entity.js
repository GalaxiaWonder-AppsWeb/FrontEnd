import {OrganizationMemberType} from "./organization-member-type.js";

export class OrganizationMember {
    constructor({
                    id = null,
                    personId = null,
                    organizationId = null,
                    type = OrganizationMemberType.CONTRACTOR,
                    joinedAt = new Date()
                }) {
        this.id = typeof id === 'number' ? id : null
        this.personId = typeof personId === 'number' ? personId : null
        this.organizationId = typeof organizationId === 'number' ? organizationId : null
        this.type = type
        this.joinedAt = joinedAt
    }

    changeType(newType) {
        this.type = newType
    }

    isWorker() {
        return this.type === OrganizationMemberType.WORKER
    }

    isContractor() {
        return this.type === OrganizationMemberType.CONTRACTOR
    }

    toJSON() {
        return {
            id: this.id,
            personId: this.personId,
            organizationId: this.organizationId,
            type: this.type,
            joinedAt: this.joinedAt
        }
    }
}