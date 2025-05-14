import { Project } from "../model/project.entity.js"
import { OrganizationMemberId } from "../../organizations/model/organization-member.entity.js"
import { OrganizationId } from "../../organizations/model/organization.entity.js"
import { Schedule } from "../model/schedule.entity.js"
import { ContractingEntityId } from "../../shared/model/contracting-entity-id.js";

export class ProjectAssembler {
    static toEntityFromResource(resource) {
        return new Project({
            id: resource.id,
            name: resource.name,
            description: resource.description,
            status: resource.status,
            schedule: new Schedule(resource.schedule),
            budget: resource.budget,
            startingDate: new Date(resource.startingDate),
            endingDate: new Date(resource.endingDate),
            team: resource.team,
            organizationId: new OrganizationId(resource.organizationId),
            contractor: new OrganizationMemberId(resource.contractor),
            contractingEntityId: new ContractingEntityId(resource.contractingEntityId)
        });
    }

    static toEntitiesFromResponse(resourceList) {
        const list = Array.isArray(resourceList) ? resourceList : [resourceList];
        return list.map((item) => this.toEntityFromResource(item));
    }
}
