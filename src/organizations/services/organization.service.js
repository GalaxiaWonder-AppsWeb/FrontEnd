import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'
import { CacheService } from '../../shared/services/cache.service.js'
import axios from 'axios'
import { authService } from '../../iam/services/auth.service.js';


const baseUrl = import.meta.env.VITE_PROPGMS_API_URL;

// Crear el servicio base
const baseService = createService('/organization', {
    getAll:                     { verb: HttpVerb.GET },
    getAllInvitations:          { verb: HttpVerb.GET, path: ':id/invitations' },
    getAllMembers:              { verb: HttpVerb.GET, path: ':id/members' },
    getById:                    { verb: HttpVerb.GET, path: ':id', fullPath: true },
    getAllInvitationByPersonId: { verb: HttpVerb.GET, path: 'persons/:id/invitations' },
    getByCreatedBy:             { verb: HttpVerb.GET, path: 'by-member-person-id'},
    create:                     { verb: HttpVerb.POST, path: 'create-organization' },
    update:                     { verb: HttpVerb.PATCH, path: ':id' },
    delete:                     { verb: HttpVerb.DELETE, path: ':id' }
});

// Crear versión con caché
export const organizationService = {    // Mantener métodos originales
    ...baseService,
    
    // Sobreescribir getById para usar caché
    getById: async (params) => {
        const id = params.id || params;
        // Asegurar que id se maneja como número para consistencia
        const numericId = typeof id === 'number' ? id : Number(id);
        const cacheKey = `organization_${numericId}`;
        
        return CacheService.getData(
            cacheKey,
            () => baseService.getById(numericId)
        );
    },

    async getAllInvitations(organizationId) {
        const token = authService.getToken();
        return axios.get(
            `${baseUrl}/organization/${organizationId}/invitations`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            }
        ).then(res => res.data);
    },

    async getAllMembers(organizationId) {
        const token = authService.getToken();
        return axios.get(
            `${baseUrl}/organization/${organizationId}/members`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            }
        ).then(res => res.data);
    },

    async getAllInvitationByPersonId(personId) {
        const token = authService.getToken();
        return axios.get(
            `${baseUrl}/organization/persons/${personId}/invitations`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            }
        ).then(res => res.data);
    },


    async getByPersonId(personId) {
        const token = authService.getToken();
        return axios.get(
            `${baseUrl}/organization/by-member-person-id/${personId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            }
        ).then(res => res.data);
    },

    // Al crear, actualizar o eliminar, invalidar caché relacionada
    create: async (data) => {
        const result = await baseService.create(data);
        CacheService.invalidateAll(); // Invalidar caché después de crear
        return result;
    },
    
    update: async (data) => {
        const id = data.id;
        const result = await baseService.update(data);
        CacheService.invalidate(`organization_${id}`); // Invalidar caché específica
        return result;
    },
    
    delete: async (params) => {
        const id = params.id || params;
        const result = await baseService.delete(id);
        CacheService.invalidate(`organization_${id}`); // Invalidar caché específica
        CacheService.invalidateAll(); // También invalidar listas que podrían contener esta organización
        return result;
    }
}
