import { Organization } from "../model/organization.entity.js";

export class OrganizationAssembler {
    static toEntityFromResource(resource) {
        return new Organization({
            id: resource.id,
            legalName: resource.legalName,
            commercialName: resource.commercialName,
            ruc: resource.ruc,
            createdBy: resource.createdBy,
            createdAt: resource.createdAt,
            status: resource.status,
            members: resource.members,
            invitations: resource.invitations
        });
    }

    static toEntitiesFromResponse(resourceList) {
        const list = Array.isArray(resourceList) ? resourceList : [resourceList];
        return list.map((item) => this.toEntityFromResource(item));
    }

}
