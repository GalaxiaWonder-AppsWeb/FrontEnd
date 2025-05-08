import {PersonId} from '../../iam/model/person.entity.js'
import {OrganizationId} from "./organization.entity.js";
import {OrganizationMemberType} from "./organization-member-type.js";

export class OrganizationMember {
    constructor({
                    id = new OrganizationMemberId(),
                    personId = new PersonId(),
                    organizationId = new OrganizationId(),
                    type = OrganizationMemberType.CONTRACTOR,
                    joinedAt = new Date()
                }) {
        this.id = id
        this.personId = personId
        this.organizationId = organizationId
        this.type = type
        this.joinedAt = joinedAt
    }

    toJSON() {
        return {
            id: this.id?.value ?? null,
            personId: this.personId?.value ?? null,
            organizationId: this.organizationId?.value ?? null,
            type: this.type,
            joinedAt: this.joinedAt
        }
    }
}

export class OrganizationMemberId {
    constructor() {
    }
}