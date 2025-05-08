import {Ruc} from './ruc.js'
import {PersonId} from '../../iam/model/person.entity.js'
import {OrganizationStatus} from "./organization-status.js";
import {OrganizationInvitationStatus} from "./organization-invitation-status.js";
import {OrganizationInvitation} from "./organization-invitation.entity.js";

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

    addMember(member) {
        this.members.push(member)
    }

    removeMemberByPersonId(personId) {
        this.members = this.members.filter(m => !m.personId.value === personId.value)
    }

    invitePerson(personId, invitedBy) {
        const alreadyInvited = this.invitations.some(i =>
            i.personId.value === personId.value && i.status === OrganizationInvitationStatus.PENDING
        )
        if (alreadyInvited) {
            throw new Error('Person already has a pending invitation')
        }

        const invitation = new OrganizationInvitation({
            organizationId: this.id,
            personId,
            invitedBy
        })

        this.invitations.push(invitation)
        return invitation
    }

    deactivate() {
        this.status = OrganizationStatus.INACTIVE
    }

    toJSON() {
        return {
            id: this.id?.value ?? null,
            legalName: this.legalName,
            commercialName: this.commercialName,
            ruc: this.ruc?.value ?? null,
            createdBy: this.createdBy?.value ?? null,
            createdAt: this.createdAt,
            status: this.status
        }
    }
}

export class OrganizationId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}