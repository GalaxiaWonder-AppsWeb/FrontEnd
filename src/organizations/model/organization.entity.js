import {Ruc} from './ruc.js'
import {PersonId} from '../../iam/model/person.entity.js'
import {OrganizationStatus} from "./organization-status.js";

export class Organization {
    constructor({
                    id = new OrganizationId(),
                    legalName = '',
                    commercialName = '',
                    ruc = new Ruc(),
                    createdBy = new PersonId(),
                    createdAt = new Date(),
                    status = OrganizationStatus.ACTIVE,
                    members = [],
                    invitations = []
                }) {
        this.id = id
        this.legalName = legalName
        this.commercialName = commercialName
        this.ruc = ruc
        this.createdBy = createdBy
        this.createdAt = createdAt
        this.status = status
        this.members = members
        this.invitations = invitations
    }

    toJSON() {
        return {
            id: this.id?.value ?? null,
            legalName: this.legalName,
            commercialName: this.commercialName,
            ruc: this.ruc?.value ?? null,
            createdBy: this.createdBy?.value ?? null,
            createdAt: this.createdAt,
            status: this.status,
            members: this.members,
            invitations: this.invitations
        }
    }
}

export class OrganizationId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}