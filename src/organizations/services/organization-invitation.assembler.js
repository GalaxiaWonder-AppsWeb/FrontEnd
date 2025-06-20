import {  OrganizationInvitation } from '../model/organization-invitation.entity.js';

export class OrganizationInvitationAssembler {
    static toEntityFromResource(resource) {
        return new OrganizationInvitation({
            id: resource.id,
            organizationName: resource.organizationName,
            personId: resource.personId,
            invitedByFullName: resource.invitedByFullName,
            invitedByEmail: resource.invitedByEmail,
            status: resource.status,
            invitedOn: new Date(resource.invitedOn),
            acceptedAt: resource.acceptedAt ? new Date(resource.acceptedAt) : null
        });
    }

    static toEntitiesFromResponse(resourceList) {
        const list = Array.isArray(resourceList) ? resourceList : [resourceList];
        return list.map((item) => this.toEntityFromResource(item));
    }
}