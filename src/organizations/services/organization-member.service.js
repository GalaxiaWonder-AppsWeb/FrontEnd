import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'
import { BaseService } from '../../shared/services/base.service.js'
import axios from 'axios'

// Definimos una clase extendida para añadir funciones personalizadas
class OrganizationMemberService extends BaseService {
    constructor() {
        super('/members');
    }    // Método para obtener miembros por el ID de la organización
    async getByOrgId(organizationId) {
        try {
            if (!organizationId) {
                console.error("Se requiere organizationId");
                return [];
            }
            
            console.log(`Buscando miembros de la organización con ID=${organizationId}`);
            
            // URL base viene de BaseService, añadimos organizationId como parámetro de consulta
            const url = `${this.url}?organizationId=${organizationId}`;
            console.log(`URL de petición: ${url}`);
            
            // Configuración con headers anti-cache
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            };
            
            const response = await axios.get(url, config);
            console.log("Respuesta de miembros:", response.data);
            
            // Para mantener compatibilidad con el formato anterior
            // donde se esperaba response.data o directamente response
            if (response.data) {
                return {
                    data: Array.isArray(response.data) ? response.data : [],
                    status: response.status
                };
            } else {
                console.warn("No se encontraron miembros para esta organización");
                return [];
            }
        } catch (error) {
            console.error("Error en getByOrgId:", error);
            return [];
        }
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

// Creamos una instancia del servicio personalizado
const memberServiceInstance = new OrganizationMemberService();

// Creamos el servicio base con createService para operaciones básicas
const baseService = createService('/members', {
    create:         { verb: HttpVerb.POST },
    delete:         { verb: HttpVerb.DELETE, path: ':id' },
    updateType:     { verb: HttpVerb.PATCH, path: ':id/type', fullPath: true }
});

// Combinamos ambos enfoques para tener lo mejor de ambos mundos
export const organizationMemberService = {
    ...baseService,
    // Sobrescribimos los métodos que necesitan usar parámetros de consulta
    getByOrgId: (params) => {
        const id = params.id || params;
        return memberServiceInstance.getByOrgId(id);
    },
    getByPersonId: (params) => {
        const id = params.id || params;
        return axios.get(`${memberServiceInstance.url}?personId=${id}`).then(res => res.data);
    },
    getByPersonAndOrgId: (params) => {
        return axios.get(`${memberServiceInstance.url}?organizationId=${params.organizationId}&personId=${params.personId}`).then(res => res.data);
    }
};

// Mantenemos la versión anterior para compatibilidad con código existente
export const organizationMemberServiceCustom = memberServiceInstance;