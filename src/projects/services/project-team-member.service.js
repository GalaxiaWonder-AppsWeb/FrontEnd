// src/projects/services/project-team-member.service.js
import { createService } from '../../shared/services/create.service.js';
import { HttpVerb } from '../../shared/services/http-verb.js';
import { ProjectTeamMemberAssembler } from './project-team-member.assembler.js';
import { BaseService } from '../../shared/services/base.service.js';

// Extending BaseService to handle specialized methods for project team members
class ProjectTeamService extends BaseService {
    constructor() {
        super('/project-team-members');
    }
    
    // Get all team members for a specific project
    async getByProjectId(projectId) {
        try {
            console.log(`Getting team members for project ID: ${projectId}`);
            // Use query parameters to filter members by projectId
            const response = await this.get('', { projectId: projectId });
            console.log('Response from GET team members by projectId:', response.data);
            return ProjectTeamMemberAssembler.toEntitiesFromResponse(response.data);
        } catch (error) {
            console.error(`Error fetching team members for project ${projectId}:`, error);
            throw error;
        }
    }
    
    // Add a new team member to a project
    async addToProject(projectId, memberId, specialty) {
        try {
            console.log(`Adding member ${memberId} to project ${projectId} with specialty ${specialty}`);
            const teamMember = {
                projectId: projectId,
                memberId: memberId,
                role: 'Specialist', // As per requirement, all members are Specialists
                specialty: specialty
            };
            
            const response = await this.post('', teamMember);
            console.log('Response from POST add team member:', response.data);
            return ProjectTeamMemberAssembler.toEntityFromResource(response.data);
        } catch (error) {
            console.error(`Error adding team member to project ${projectId}:`, error);
            throw error;
        }
    }
}

// Create instance of specialized service
const projectTeamServiceInstance = new ProjectTeamService();

// Export the service with standard CRUD operations and specialized methods
export const projectTeamMemberService = {
    ...createService('/project-team-members', {
        getAll: { verb: HttpVerb.GET },
        getById: { verb: HttpVerb.GET, path: ':id' },
        create: { verb: HttpVerb.POST },
        update: { verb: HttpVerb.PUT, path: ':id' },
        delete: { verb: HttpVerb.DELETE, path: ':id' }
    }, ProjectTeamMemberAssembler),
    
    // Add the specialized methods from our custom service
    getByProjectId: (projectId) => projectTeamServiceInstance.getByProjectId(projectId),
    addToProject: (projectId, memberId, specialty) => 
        projectTeamServiceInstance.addToProject(projectId, memberId, specialty)
};