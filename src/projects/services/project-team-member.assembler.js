// src/projects/services/project-team-member.assembler.js
import { ProjectTeamMember } from "../model/project-team-member.entity.js";
import { ProjectRole } from "../model/project-role.js";
import { Specialty } from "../model/specialty.js";

export class ProjectTeamMemberAssembler {
    /**
     * Converts an API resource to a ProjectTeamMember entity
     */
    static toEntityFromResource(resource) {
        try {
            // Validate resource fields
            const id = typeof resource.id === 'number' ? resource.id : null;
            const memberId = typeof resource.memberId === 'number' ? resource.memberId : 
                (typeof resource.memberId === 'string' ? parseInt(resource.memberId, 10) : null);

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
            return new ProjectTeamMember({
                id: id,
                role: role,
                specialty: specialty,
                memberId: memberId
            });
        } catch (error) {
            console.error("Error converting resource to ProjectTeamMember entity:", error);
            // Return a default ProjectTeamMember in case of error
            return new ProjectTeamMember({
                role: ProjectRole.SPECIALIST,
                specialty: Specialty.ARCHITECTURE,
                memberId: 0
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
            memberId: entity.memberId
        };
    }
}