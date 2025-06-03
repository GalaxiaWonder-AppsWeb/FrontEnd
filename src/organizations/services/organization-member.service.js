import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'
import { BaseService } from '../../shared/services/base.service.js'
import axios from 'axios'

// Definimos una clase extendida para añadir funciones personalizadas
class OrganizationMemberService extends BaseService {
    constructor() {
        super('/members');
    }
    
    // Método personalizado para obtener miembro por personId y organizationId
    async getByPersonAndOrgIdCustom(params) {
        try {
            if (!params.personId || !params.organizationId) {
                console.error("Se requieren ambos, personId y organizationId");
                return [];
            }
            
            console.log(`Buscando miembro con personId=${params.personId} y organizationId=${params.organizationId}`);
            
            const url = `${this.url}?organizationId=${params.organizationId}&personId=${params.personId}`;
            console.log(`URL de petición: ${url}`);
            
            const response = await axios.get(url);
            console.log("Respuesta completa:", response.data);
            
            if (response.data && response.data.length > 0) {
                return response.data;
            } else {
                console.warn("No se encontraron datos para la combinación de personId y organizationId");
                return [];
            }
        } catch (error) {
            console.error("Error en getByPersonAndOrgIdCustom:", error);
            return [];
        }
    }
    
    // Crear miembro y actualizar la organización
    async createMember(memberData) {
        // 1. Crear el miembro
        const response = await this.post('', memberData);
        const createdMember = response.data || response;
        // 2. Actualizar la organización agregando el id del miembro
        try {
            const orgId = memberData.organizationId;
            // Obtener la organización
            const orgRes = await axios.get(`/organizations/${orgId}`);
            const org = orgRes.data;
            if (!org.members) org.members = [];
            // Evitar duplicados
            if (!org.members.includes(createdMember.id)) {
                org.members.push(createdMember.id);
                await axios.put(`/organizations/${orgId}`, org);
            }
        } catch (e) {
            console.error('No se pudo actualizar la organización con el nuevo miembro:', e);
        }
        return createdMember;
    }
}

// Exportamos una instancia del servicio personalizado
export const organizationMemberServiceCustom = new OrganizationMemberService();

// Mantenemos la versión original para compatibilidad
export const organizationMemberService = createService('/members', {
    create:         { verb: HttpVerb.POST },
    delete:         { verb: HttpVerb.DELETE, path: ':id' },
    getByOrgId:     { verb: HttpVerb.GET, path: 'organization/:id', fullPath: true },
    getByPersonId:  { verb: HttpVerb.GET, path: 'person/:id', fullPath: true },
    getByPersonAndOrgId:  { verb: HttpVerb.GET, path: 'organization/:organizationId/person/:personId', fullPath: true },
    updateType:     { verb: HttpVerb.PATCH, path: ':id/type', fullPath: true }
})