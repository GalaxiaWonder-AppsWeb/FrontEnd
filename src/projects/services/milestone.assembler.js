import { Milestone } from '../model/milestone.entity.js';

export class MilestoneAssembler {    static toEntityFromResource(resource) {
        // Handle both date field formats (startDate/endDate and startingDate/endingDate)
        const startDate = resource.startDate || resource.startingDate;
        const endDate = resource.endDate || resource.endingDate;
        
        // Parse numeric IDs from string if needed
        let id = resource.id;
        if (typeof id === 'string' && !isNaN(Number(id))) {
            id = Number(id);
        }
        
        let projectId = resource.projectId;
        if (typeof projectId === 'string' && !isNaN(Number(projectId))) {
            projectId = Number(projectId);
        }
        
        return new Milestone({
            id: id,
            name: resource.name,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : new Date(),
            items: resource.items || [],
            projectId: projectId,
        });
    }

    static toEntitiesFromResponse(resourceList) {
        const list = Array.isArray(resourceList) ? resourceList : [resourceList];
        return list.map((item) => this.toEntityFromResource(item));
    }
}