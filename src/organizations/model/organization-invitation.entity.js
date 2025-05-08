import {OrganizationId} from "./organization.entity.js";
import {PersonId} from "../../iam/model/person.entity.js";
import {OrganizationStatus} from "./organization-status.js";

export class OrganizationInvitation {
    constructor({
        organizationInvitationId = new OrganizationInvitationId(),
        organizationId = new OrganizationId(),
        personId = new PersonId(),
        invitedBy = new PersonId(),
        invitedAt = new Date(),
        acceptedAt = null,
        status = OrganizationStatus.ACTIVE
                }) {
        this.id = organizationInvitationId
        this.organizationId = organizationId
        this.personId = personId
        this.invitedBy = invitedBy
        this.invitedAt = invitedAt
        this.acceptedAt = acceptedAt
        this.status = status
    }

    toJSON() {
        return {
            id: this.id?.value ?? null,
            organizationId: this.organizationId?.value ?? null,
            personId: this.personId?.value ?? null,
            invitedBy: this.invitedBy?.value ?? null,
            invitedAt: this.invitedAt,
            acceptedAt: this.acceptedAt,
            status: this.status
        }
    }
}

export class OrganizationInvitationId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}