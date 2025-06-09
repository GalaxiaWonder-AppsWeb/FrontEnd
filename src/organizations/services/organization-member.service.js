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
            
            //console.log(`Buscando miembros de la organización con ID=${organizationId}`);
            
            // URL base viene de BaseService, añadimos organizationId como parámetro de consulta
            const url = `${this.url}?organizationId=${organizationId}`;
            //console.log(`URL de petición: ${url}`);
            
            // Configuración con headers anti-cache
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            };
            
            const response = await axios.get(url, config);
            //console.log("Respuesta de miembros:", response.data);
            
            // Para mantener compatibilidad con el formato anterior
            // donde se esperaba response.data o directamente response
            if (response.data) {
                return {
                    data: Array.isArray(response.data) ? response.data : [],
                    status: response.status
                };
            } else {
                //console.warn("No se encontraron miembros para esta organización");
                return [];
            }
        } catch (error) {
            //console.error("Error en getByOrgId:", error);
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
            
            //console.log(`Buscando miembro con personId=${params.personId} y organizationId=${params.organizationId}`);
            
            const url = `${this.url}?organizationId=${params.organizationId}&personId=${params.personId}`;
            //console.log(`URL de petición: ${url}`);
            
            const response = await axios.get(url);
            //console.log("Respuesta completa:", response.data);
            
            if (response.data && response.data.length > 0) {
                return response.data;
            } else {
                //console.warn("No se encontraron datos para la combinación de personId y organizationId");
                return [];
            }
        } catch (error) {
            //console.error("Error en getByPersonAndOrgIdCustom:", error);
            return [];
        }
    }      // Crear miembro y actualizar la organización
    async createMember(memberData) {
        //console.log("OrganizationMemberService.createMember - datos recibidos:", memberData);
        
        // 1. Extraer el ID de la organización, que podría ser un valor directo o un objeto
        const orgId = memberData.organizationId && memberData.organizationId.value 
            ? memberData.organizationId.value 
            : memberData.organizationId;
            
        //console.log("OrganizationMemberService.createMember - ID de organización:", orgId);
        
        if (!orgId) {
            throw new Error("ID de organización no válido");
        }
        
        // 2. Crear el miembro
        const response = await this.post('', memberData);
        const createdMember = response.data || response;
        //console.log("OrganizationMemberService.createMember - miembro creado:", createdMember);
        
        // 3. Actualizar la organización agregando el id del miembro
        try {
            // Usar la URL base completa del API para asegurar que vaya al servidor correcto
            const apiBaseUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
            
            // Obtener la organización
            c//onsole.log(`OrganizationMemberService.createMember - obteniendo organización: ${apiBaseUrl}/organizations/${orgId}`);
            
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };
            
            const orgRes = await axios.get(`${apiBaseUrl}/organizations/${orgId}`, config);
            
            // Verificar que la respuesta sea JSON y no HTML
            if (typeof orgRes.data === 'string' && orgRes.data.includes('<!doctype html>')) {
                throw new Error('La respuesta recibida es HTML en lugar de JSON. Verifica la URL del API.');
            }
            
            const org = orgRes.data;
            //console.log("OrganizationMemberService.createMember - organización obtenida:", org);
            
            // Inicializar array de miembros si no existe
            if (!org.members) org.members = [];
            
            // Evitar duplicados
            if (!org.members.includes(createdMember.id)) {
                org.members.push(createdMember.id);
                //console.log(`OrganizationMemberService.createMember - actualizando organización con nuevo miembro:`, org);
                await axios.put(`${apiBaseUrl}/organizations/${orgId}`, org, config);
            }
        } catch (e) {
            console.error('No se pudo actualizar la organización con el nuevo miembro:', e);
            console.error('Detalles del error:', e.message);
            if (e.response) {
                console.error('Respuesta del servidor:', e.response.status, e.response.data);
            }
        }
        return createdMember;
    }
    
    // Método especializado para crear un miembro contratista (creador de la organización)
    async createContractorMember(personId, organizationId, type = 'Contractor') {
        //console.log("createContractorMember - Creando contratista:", { personId, organizationId, type });
        
        // Preparar datos para la creación del miembro
        const memberData = {
            personId: typeof personId === 'object' ? personId.value : personId,
            organizationId: typeof organizationId === 'object' ? organizationId.value : organizationId,
            type: type,
            joinedAt: new Date().toISOString()
        };
        
        //console.log("createContractorMember - Datos preparados:", memberData);
        
        try {
            // Crear el miembro usando el método genérico
            const result = await this.createMember(memberData);
            //console.log("createContractorMember - Miembro contratista creado:", result);
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

// Importamos el servicio de caché
import { CacheService } from '../../shared/services/cache.service.js';

// Combinamos ambos enfoques para tener lo mejor de ambos mundos
export const organizationMemberService = {
    ...baseService,
    // Sobrescribimos los métodos que necesitan usar parámetros de consulta con caché
    getByOrgId: (params) => {
        const id = params.id || params;
        const cacheKey = `members_org_${id}`;
        
        return CacheService.getData(
            cacheKey,
            () => memberServiceInstance.getByOrgId(id)
        );
    },
    getByPersonId: (params) => {
        const id = params.id || params;
        const cacheKey = `members_person_${id}`;
        
        return CacheService.getData(
            cacheKey,
            () => axios.get(`${memberServiceInstance.url}?personId=${id}`).then(res => res.data)
        );
    },
    getByPersonAndOrgId: (params) => {
        const cacheKey = `members_org_${params.organizationId}_person_${params.personId}`;
        
        return CacheService.getData(
            cacheKey,
            () => axios.get(`${memberServiceInstance.url}?organizationId=${params.organizationId}&personId=${params.personId}`).then(res => res.data)
        );
    },
    
    // Al crear, actualizar o eliminar, invalidamos la caché relacionada
    create: async (data) => {
        const result = await baseService.create(data);
        // Invalidar caché de miembros para esta organización
        CacheService.invalidate(`members_org_${data.organizationId}`);
        return result;
    },
    
    delete: async (params) => {
        const id = params.id || params;
        // Primero necesitamos obtener el miembro para conocer su orgId
        try {
            const member = await axios.get(`${memberServiceInstance.url}/${id}`).then(res => res.data);
            const result = await baseService.delete(id);
            
            // Invalidar caché relacionada
            if (member && member.organizationId) {
                CacheService.invalidate(`members_org_${member.organizationId}`);
            }
            
            return result;
        } catch (error) {
            // Si hay error al obtener el miembro, intentar eliminar e invalidar toda la caché
            const result = await baseService.delete(id);
            CacheService.invalidateAll();
            return result;
        }
    }
};

// Mantenemos la versión anterior para compatibilidad con código existente
export const organizationMemberServiceCustom = memberServiceInstance;