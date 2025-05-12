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
        if (!legalName || typeof legalName !== 'string') {
            throw new Error('Legal name is required and must be a non-empty string')
        }

        if (!(ruc instanceof Ruc) || !ruc.value) {
            throw new Error('RUC must be a valid Ruc instance with a value')
        }

        if (!(createdBy instanceof PersonId) || !createdBy.value) {
            throw new Error('createdBy must be a valid PersonId instance with a value')
        }

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

    updateLegalName(newLegalName) {
        if (!newLegalName || typeof newLegalName !== 'string') {
            throw new Error('Legal name must be a non-empty string')
        }
        this.legalName = newLegalName
    }

    updateCommercialName(newCommercialName) {
        if (!newCommercialName || typeof newCommercialName !== 'string') {
            throw new Error('Commercial name must be a non-empty string')
        }
        this.commercialName = newCommercialName
    }

    addMember(member) {
        this.members.push(member)
    }

    removeMemberByPersonId(personId) {
        this.members = this.members.filter(m => m.personId.value !== personId.value)
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
        console.log('Valor de this.id antes de serializar:', this.id);
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
    constructor(value) {
        // Si no se proporciona un valor, genera un UUID
        this.value = value || crypto.randomUUID();
    }
}