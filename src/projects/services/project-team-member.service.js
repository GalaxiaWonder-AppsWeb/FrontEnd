import { createService } from '../../shared/services/create.service.js';
import { HttpVerb } from '../../shared/services/http-verb.js';

// Crear el servicio base con las operaciones CRUD
const baseService = createService('/project-team-members', {
    getAll:    { verb: HttpVerb.GET },                        // GET /project-team-members
    getById:   { verb: HttpVerb.GET, path: ':id', fullPath: true }, // GET /project-team-members/:id
    create:    { verb: HttpVerb.POST },                       // POST /project-team-members
    update:    { verb: HttpVerb.PUT, path: ':id' },           // PUT /project-team-members/:id
    delete:    { verb: HttpVerb.DELETE, path: ':id' },        // DELETE /project-team-members/:id
    getByProjectId: { verb: HttpVerb.GET, path: '?projectId=:projectId', fullPath: true },
    getByProjectIdAndSpecialty: { verb: HttpVerb.GET, path: '?projectId=:projectId&specialty=:specialty', fullPath: true },
});

// Extender el servicio base con funciones adicionales
export const projectTeamMemberService = {
    ...baseService,
    
    /**
     * Obtiene los miembros de un proyecto por ID y especialidad
     * @param {Object} params - Parámetros de la consulta
     * @param {number} params.projectId - ID del proyecto
     * @param {string} params.specialty - Especialidad requerida
     * @returns {Promise<Array>} - Lista de miembros que coinciden con los criterios
     */    async getByProjectIdAndSpecialty(params) {
        try {
            if (!params || !params.projectId) {
                throw new Error('Project ID is required for getByProjectIdAndSpecialty');
            }
            
            if (!params.specialty) {
                console.warn('[projectTeamMemberService] No specialty provided, falling back to getByProjectId');
                return this.getByProjectId(params);
            }
            
            // Usar el servicio base con los parámetros completos
            const result = await baseService.getByProjectIdAndSpecialty(params);
            return result;
        } catch (error) {
            console.error('[projectTeamMemberService] Error buscando miembros por proyecto y especialidad:', error);
            // Intentar como fallback obtener todos los miembros del proyecto
            console.warn('[projectTeamMemberService] Intentando fallback a getByProjectId');
            try {
                return await this.getByProjectId({ projectId: params.projectId });
            } catch (fallbackError) {
                console.error('[projectTeamMemberService] Error en fallback:', fallbackError);
                return []; // Devolver array vacío en caso de error
            }
        }
    },
    
    /**
     * Obtiene los miembros de un proyecto por ID
     * @param {Object} params - Parámetros de la consulta
     * @param {number} params.projectId - ID del proyecto
     * @returns {Promise<Array>} - Lista de miembros del proyecto
     */
    async getByProjectId(params) {
        try {
            if (!params || !params.projectId) {
                throw new Error('Project ID is required for getByProjectId');
            }
            
            // Intentar dos enfoques: primero con el service base, luego con una búsqueda manual
            try {
                // 1. Usar el servicio base
                const result = await baseService.getByProjectId(params);
                return result;
            } catch (serviceError) {
                console.warn('[projectTeamMemberService] Error con servicio base, intentando alternativa:', serviceError);
                
                // 2. Método alternativo: obtener todos y filtrar manualmente
                const allMembers = await baseService.getAll();
                const filteredMembers = allMembers.filter(
                    member => member.projectId === Number(params.projectId)
                );
                return filteredMembers;
            }
        } catch (error) {
            console.error('[projectTeamMemberService] Error buscando miembros por proyecto:', error);
            return []; // Devolver array vacío en caso de error
        }
    },
    
    /**
     * Agrega un miembro a un proyecto
     * @param {number} projectId - ID del proyecto
     * @param {number} memberId - ID del miembro de la organización
     * @param {string} specialty - Especialidad del miembro (opcional, solo para SPECIALIST)
     * @param {string} role - Rol del miembro en el proyecto (COORDINATOR, SPECIALIST)
     */    
    async addToProject(projectId, memberId, specialty, role) {
        try {
            // Validar parámetros
            if (!projectId) throw new Error('Project ID is required');
            if (!memberId) throw new Error('Member ID is required');
            if (!role) throw new Error('Role is required');
            
            // Crear el objeto del miembro del proyecto
            const projectTeamMember = {
                projectId: Number(projectId),
                organizationMemberId: Number(memberId),
                role,
            };
            
            // Si es especialista, añadir la especialidad
            if (role === 'SPECIALIST' && specialty) {
                projectTeamMember.specialty = specialty;
            }
              // Llamar al servicio para crear el miembro
            const response = await this.create(projectTeamMember);
            return response;
        } catch (error) {
            throw error;
        }
    },
    
    
    
};
