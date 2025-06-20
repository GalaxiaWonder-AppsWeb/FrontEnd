import { Organization } from "../model/organization.entity.js";
import {Ruc} from "../model/ruc.js";

export class OrganizationAssembler {
    static toEntityFromResource(resource) {
        return new Organization({
            id: resource.id,
            legalName: resource.legalName,
            commercialName: resource.commercialName,
            ruc: new Ruc(resource.ruc),
            createdBy: resource.createdBy,
            createdAt: new Date(resource.createdAt),
            members: resource.members,
            invitations: resource.invitations
        });
    }

    static toEntitiesFromResponse(resourceList) {
        const list = Array.isArray(resourceList) ? resourceList : [resourceList];
        return list.map((item) => this.toEntityFromResource(item));
    }

}
