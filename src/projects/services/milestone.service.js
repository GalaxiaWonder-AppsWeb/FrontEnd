import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'
import { MilestoneAssembler } from './milestone.assembler.js'
import { BaseService } from '../../shared/services/base.service.js'
import axios from 'axios'

// Create an extended service with custom methods
class MilestoneService extends BaseService {
    constructor() {
        super('/milestones');
    }
      // Custom method to get milestones by project ID
    async getByProjectId(projectId) {
        try {
            if (typeof projectId !== 'number') {
                projectId = Number(projectId);
            }
            
            // Use JSON Server query parameter syntax for filtering
            const url = `${this.url}?projectId=${projectId}`;
            const response = await axios.get(url);
            return MilestoneAssembler.toEntitiesFromResponse(response.data);
        } catch (error) {
            console.error(`Error fetching milestones for project ${projectId}:`, error);
            return [];
        }
    }
}

// Create the instance
const milestoneServiceInstance = new MilestoneService();

// Create the standard service
export const milestoneService = {
    ...createService('/milestones', {
        getAll:   { verb: HttpVerb.GET },
        getById:  { verb: HttpVerb.GET, path: ':id' },
        create:   { verb: HttpVerb.POST },
        update:   { verb: HttpVerb.PUT, path: ':id' },
        delete:   { verb: HttpVerb.DELETE, path: ':id' }
    }, MilestoneAssembler),
    
    // Add the custom method
    getByProjectId: (projectId) => milestoneServiceInstance.getByProjectId(projectId)
}