import { OrganizationMember } from "../model/organization-member.entity.js";

export class OrganizationMemberAssembler {
    static toEntityFromResource(resource) {
        return new OrganizationMember({
            id: resource.id,
            personId: resource.personId,
            organizationId: resource.organizationId,
            type: resource.type,
            joinedAt: resource.joinedAt ? new Date(resource.joinedAt) : new Date()
        });
    }

    static toEntitiesFromResponse(resourceList) {
        const list = Array.isArray(resourceList) ? resourceList : [resourceList];
        return list.map((item) => this.toEntityFromResource(item));
    }
}