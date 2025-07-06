import {Ruc} from './ruc.js'
import {OrganizationStatus} from "./organization-status.js";
import {OrganizationInvitationStatus} from "./organization-invitation-status.js";
import {OrganizationInvitation} from "./organization-invitation.entity.js";

export class Organization {
    constructor({
                    id = null,
                    legalName = '',
                    commercialName = '',
                    ruc = new Ruc(),
                    createdBy = null,
                    createdAt = new Date(),
                    members = [],
                    invitations = []
                }) {
        if (!legalName || typeof legalName !== 'string') {
            throw new Error('Legal name is required and must be a non-empty string')
        }

        if (!(ruc instanceof Ruc) || !ruc.value) {
            throw new Error('RUC must be a valid Ruc instance with a value')
        }

        if (typeof createdBy !== 'number') {
            throw new Error('createdBy must be a valid person ID (number)')
        }

        this.id = typeof id === 'number' ? id : null
        this.legalName = legalName
        this.commercialName = commercialName
        this.ruc = ruc
        this.createdBy = createdBy
        this.createdAt = createdAt
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
        this.members = this.members.filter(m => m.personId !== personId)
    }

    invitePerson(personId, invitedBy) {
        const alreadyInvited = this.invitations.some(i =>
            i.personId === personId && i.status === OrganizationInvitationStatus.PENDING
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

    static salute(){
        
    }

    salute2(){
        
    }

    toJSON() {
        return {
            id: this.id,
            legalName: this.legalName,
            commercialName: this.commercialName,
            ruc: this.ruc?.value ?? null,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
        }
    }
}