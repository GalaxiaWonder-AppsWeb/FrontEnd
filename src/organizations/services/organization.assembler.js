import { Organization } from "../model/organization.entity.js";
import {PersonId} from "../../iam/model/person.entity.js";
import {Ruc} from "../model/ruc.js";

export class OrganizationAssembler {
    static toEntityFromResource(resource) {
        return new Organization({
            id: resource.id,
            legalName: resource.legalName,
            commercialName: resource.commercialName,
            ruc: new Ruc(resource.ruc),
            createdBy: new PersonId(resource.createdBy),
            createdAt: new Date(resource.createdAt),
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
