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
        console.log("OrganizationMemberService.createMember - datos recibidos:", memberData);
        
        // 1. Extraer el ID de la organización, que podría ser un valor directo o un objeto
        const orgId = memberData.organizationId && memberData.organizationId.value 
            ? memberData.organizationId.value 
            : memberData.organizationId;
            
        console.log("OrganizationMemberService.createMember - ID de organización:", orgId);
        
        if (!orgId) {
            throw new Error("ID de organización no válido");
        }
        
        // 2. Crear el miembro
        const response = await this.post('', memberData);
        const createdMember = response.data || response;
        console.log("OrganizationMemberService.createMember - miembro creado:", createdMember);
        
        // 3. Actualizar la organización agregando el id del miembro
        try {
            // Obtener la organización
            console.log(`OrganizationMemberService.createMember - obteniendo organización: /organizations/${orgId}`);
            const orgRes = await axios.get(`/organizations/${orgId}`);
            const org = orgRes.data;
            console.log("OrganizationMemberService.createMember - organización obtenida:", org);
            
            // Inicializar array de miembros si no existe
            if (!org.members) org.members = [];
            
            // Evitar duplicados
            if (!org.members.includes(createdMember.id)) {
                org.members.push(createdMember.id);
                console.log(`OrganizationMemberService.createMember - actualizando organización con nuevo miembro:`, org);
                await axios.put(`/organizations/${orgId}`, org);
            }
        } catch (e) {
            console.error('No se pudo actualizar la organización con el nuevo miembro:', e);
        }
        return createdMember;
    }
    
    // Método especializado para crear un miembro contratista (creador de la organización)
    async createContractorMember(personId, organizationId, type = 'Contractor') {
        console.log("createContractorMember - Creando contratista:", { personId, organizationId, type });
        
        // Preparar datos para la creación del miembro
        const memberData = {
            personId: typeof personId === 'object' ? personId.value : personId,
            organizationId: typeof organizationId === 'object' ? organizationId.value : organizationId,
            type: type,
            joinedAt: new Date().toISOString()
        };
        
        console.log("createContractorMember - Datos preparados:", memberData);
        
        try {
            // Crear el miembro usando el método genérico
            const result = await this.createMember(memberData);
            console.log("createContractorMember - Miembro contratista creado:", result);
            return result;
        } catch (error) {
            console.error("createContractorMember - Error al crear contratista:", error);
            throw error;
        }
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