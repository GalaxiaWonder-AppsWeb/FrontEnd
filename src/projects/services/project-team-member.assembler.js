import { ProjectTeamMember } from "../model/project-team-member.entity.js";
import { ProjectRole } from "../model/project-role.js";
import { Specialty } from "../model/specialty.js";

export class ProjectTeamMemberAssembler {
    /**
     * Converts an API resource to a ProjectTeamMember entity
     */    static toEntityFromResource(resource) {
        try {
            // Validate resource fields - ensure we have a proper resource object
            if (!resource) {
                console.error('Invalid resource provided to toEntityFromResource:', resource);
                return null;
            }
            
            // Parse ID making sure it's a number
            let id = null;
            if (resource.id !== undefined && resource.id !== null) {
                id = parseInt(resource.id, 10);
                if (isNaN(id)) {
                    console.warn('Invalid ID format in resource:', resource.id);
                    id = null;
                }
            }
            
            let projectId = null;
            if (resource.projectId !== undefined && resource.projectId !== null) {
                projectId = parseInt(resource.projectId, 10);
                if (isNaN(projectId)) {
                    console.warn('Invalid projectId format in resource:', resource.projectId);
                    projectId = null;
                }
            }

            // Parse organizationnMemberId making sure it's a number
            let organizationMemberId = null;
            if (resource.organizationMemberId !== undefined && resource.organizationMemberId !== null) {
                organizationMemberId = parseInt(resource.organizationMemberId, 10);
                if (isNaN(organizationMemberId)) {
                    console.warn('Invalid organizationMemberId format in resource:', resource.organizationMemberId);
                    organizationMemberId = null;
                }
            }

            // Validate role, default to SPECIALIST if needed
            const role = Object.values(ProjectRole).includes(resource.role) 
                ? resource.role 
                : ProjectRole.SPECIALIST;
            
            // Validate specialty, only required for SPECIALIST role
            let specialty = null;
            if (role === ProjectRole.SPECIALIST) {
                specialty = Object.values(Specialty).includes(resource.specialty) 
                    ? resource.specialty 
                    : Specialty.ARCHITECTURE;
            }
            

            // Create the entity with validated data
            const teamMember = new ProjectTeamMember({
                id: id,
                role: role,
                specialty: specialty,
                organizationMemberId: organizationMemberId,
                projectId: projectId
 
            });
            
            console.log('Created ProjectTeamMember entity:', teamMember);
            return teamMember;
        } catch (error) {
            console.error("Error converting resource to ProjectTeamMember entity:", error, "Resource:", resource);
            
            // Try to construct a valid organizationMemberId
            let safeorganizationMemberId = 0;
            if (resource && resource.organizationMemberId !== undefined) {
                const parsedId = parseInt(resource.organizationMemberId, 10);
                safeorganizationMemberId = !isNaN(parsedId) ? parsedId : 0;
            }
            
            // Return a default ProjectTeamMember in case of error
            return new ProjectTeamMember({
                role: ProjectRole.SPECIALIST,
                specialty: Specialty.ARCHITECTURE,
                organizationMemberId: safeorganizationMemberId,
            });
        }
    }

    /**
     * Converts a list of API resources to ProjectTeamMember entities
     */
    static toEntitiesFromResponse(resourceList) {
        if (!resourceList) return [];
        
        const list = Array.isArray(resourceList) ? resourceList : [resourceList];
        return list
            .map(item => {
                try {
                    return this.toEntityFromResource(item);
                } catch (e) {
                    console.error("Error converting team member item:", e);
                    return null;
                }
            })
            .filter(item => item !== null); // Filter out items that couldn't be converted
    }
    
    /**
     * Converts a ProjectTeamMember entity to an API resource format
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            role: entity.role,
            specialty: entity.specialty,
            organizationMemberId: entity.organizationMemberId,
            projectId: entity.projectId
        };
    }
}