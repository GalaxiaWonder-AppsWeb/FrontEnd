import {OrganizationId} from "./organization.entity.js";
import {PersonId} from "../../iam/model/person.entity.js";
import {OrganizationInvitationStatus} from "./organization-invitation-status.js";

export class OrganizationInvitation {
    constructor({
        organizationInvitationId = new OrganizationInvitationId(),
        organizationId = new OrganizationId(),
        personId = new PersonId(),
        invitedBy = new PersonId(),
        invitedAt = new Date(),
        acceptedAt = null,
        status = OrganizationInvitationStatus.PENDING
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

    accept(date = new Date()) {
        if (this.status !== OrganizationInvitationStatus.PENDING) {
            throw new Error('Invitation cannot be accepted')
        }
        this.status = OrganizationInvitationStatus.ACCEPTED
        this.acceptedAt = date
    }

    reject() {
        if (this.status !== OrganizationInvitationStatus.PENDING) {
            throw new Error('Invitation cannot be rejected')
        }
        this.status = OrganizationInvitationStatus.REJECTED
        this.acceptedAt = null
    }

    isPending() {
        return this.status === OrganizationInvitationStatus.PENDING
    }
}

export class OrganizationInvitationId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}