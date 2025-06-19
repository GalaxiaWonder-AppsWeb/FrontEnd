import { OrganizationInvitationStatus } from "./organization-invitation-status.js";

export class OrganizationInvitation {
    constructor({
                    id = null,
                    organizationName = '',
                    personId = '',
                    invitedByFullName = '',
                    invitedByEmail = '',
                    status = OrganizationInvitationStatus.PENDING,
                    invitedOn = new Date(),
                    acceptedAt = null,
                }) {
        this.id = Number.isInteger(id) ? id : null;
        this.organizationName = organizationName
        this.personId = personId
        this.invitedByFullName = invitedByFullName
        this.invitedByEmail = invitedByEmail
        this.invitedOn = invitedOn
        this.acceptedAt = acceptedAt ? new Date(acceptedAt) : null;
        this.status = status;
    }

    toJSON() {
        return {
            id: this.id,
            organizationName: this.organizationName,
            personId: this.personId,
            invitedByFullName: this.invitedByFullName,
            invitedByEmail: this.invitedByEmail,
            invitedOn: this.invitedOn?.toISOString(),
            acceptedAt: this.acceptedAt?.toISOString(),
            status: this.status
        }
    }

    accept(date = new Date()) {
        if (!this.isPending()) {
            throw new Error('Invitation cannot be accepted');
        }
        this.status = OrganizationInvitationStatus.ACCEPTED;
        this.acceptedAt = date;
    }

    reject() {
        if (!this.isPending()) {
            throw new Error('Invitation cannot be rejected');
        }
        this.status = OrganizationInvitationStatus.REJECTED;
        this.acceptedAt = null;
    }

    isPending() {
        return this.status === OrganizationInvitationStatus.PENDING;
    }
}
