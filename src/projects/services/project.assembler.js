import { Project } from "../model/project.entity.js"
import { Schedule } from "../model/schedule.entity.js"

export class ProjectAssembler {    static toEntityFromResource(resource) {
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
            organizationId: resource.organizationId,
            contractor: resource.contractor,
            contractingEntityId: resource.contractingEntityId,
            createdBy: resource.createdBy,
            createdAt: resource.createdAt ? new Date(resource.createdAt) : new Date()
        });
    }

    static toEntitiesFromResponse(resourceList) {
        const list = Array.isArray(resourceList) ? resourceList : [resourceList];
        return list.map((item) => this.toEntityFromResource(item));
    }
}
