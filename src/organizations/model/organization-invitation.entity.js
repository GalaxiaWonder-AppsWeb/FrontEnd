import {OrganizationInvitationStatus} from "./organization-invitation-status.js";

export class OrganizationInvitation {
    constructor({
        id = null,
        organizationId = null,
        personId = null,
        invitedBy = null,
        invitedAt = new Date(),
        acceptedAt = null,
        status = OrganizationInvitationStatus.PENDING
                }) {
        this.id = typeof id === 'number' ? id : null
        this.organizationId = typeof organizationId === 'number' ? organizationId : null
        this.personId = typeof personId === 'number' ? personId : null
        this.invitedBy = typeof invitedBy === 'number' ? invitedBy : null
        this.invitedAt = invitedAt
        this.acceptedAt = acceptedAt
        this.status = status
    }

    toJSON() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            personId: this.personId,
            invitedBy: this.invitedBy,
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