import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'
import axios from 'axios'

// Usar API URL desde variables de entorno, compatible con Azure App Service
const baseURL = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000'
// Prefijo de API para ASP.NET Core (ajustar según la configuración de rutas de ASP.NET)
const apiPrefix = import.meta.env.VITE_API_PREFIX || 'api'

// Servicio de invitaciones optimizado para producción con ASP.NET Core
export const OrganizationInvitationService = {
    // Mantener compatibilidad con el servicio actual durante desarrollo
    ...createService('/invitations', {
        getByOrganizationId: { verb: HttpVerb.GET, path: 'organization/:id', fullPath: true },
        invitePerson: { verb: HttpVerb.POST, path: '', fullPath: false },
    }),
      /**
     * Método de utilidad para obtener invitaciones por organizationId
     * Compatible con ASP.NET Core
     * @param {string} organizationId - ID de la organización
     * @returns {Promise<Array>} - Promesa con las invitaciones
     */
    async getByOrgId(organizationId) {
        if (!organizationId) {
            console.error('[InvitationService] organizationId es requerido');
            return [];
        }
        
        try {
            console.log(`[InvitationService] Obteniendo invitaciones para organización ID: ${organizationId}`);
            
            // Configuración con parámetros anti-cache y headers apropiados
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                params: {
                    _t: new Date().getTime()
                }
            };
            
            // En ASP.NET Core, esta ruta sería algo como:
            // GET /api/organizations/{id}/invitations
            const response = await axios.get(`${baseURL}/invitations/organization/${organizationId}`, config);
            
            // Validar respuesta
            if (!Array.isArray(response.data)) {
                console.warn('[InvitationService] La respuesta no es un array:', response.data);
                return [];
            }
            
            return response.data;
        } catch (error) {
            console.error('[InvitationService] Error al obtener invitaciones por organización:', error);
            return []; // Devolver array vacío en caso de error para evitar errores en cascada
        }
    },
    
    /**
     * Crea una nueva invitación para un usuario a una organización
     * Compatible con ASP.NET Core
     * @param {Object} invitationData - Datos de la invitación
     * @param {string} invitationData.organizationId - ID de la organización
     * @param {string} invitationData.personId - ID de la persona invitada
     * @param {string} invitationData.invitedBy - ID de quien invita
     * @returns {Promise<Object>} - Promesa con la invitación creada
     */    /**
     * Obtiene invitaciones por ID de persona
     * @param {string} personId - ID de la persona
     * @returns {Promise<Array>} - Promesa con las invitaciones
     */
    async getByPersonId(personId) {
        if (!personId) {
            console.error('[InvitationService] personId es requerido');
            return [];
        }
        
        try {
            console.log(`[InvitationService] Obteniendo invitaciones para persona ID: ${personId}`);
            
            // Configuración con parámetros anti-cache y headers apropiados
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                params: {
                    _t: new Date().getTime()
                }
            };
            
            // Llamada al endpoint con queryParams para filtrar por personId y status=Pending
            const response = await axios.get(`${baseURL}/invitations?personId=${personId}&status=Pending`, config);
            
            // Validar respuesta
            if (!Array.isArray(response.data)) {
                console.warn('[InvitationService] La respuesta no es un array:', response.data);
                return [];
            }
            
            console.log(`[InvitationService] Se encontraron ${response.data.length} invitaciones para persona ${personId}`);
            return response.data;
        } catch (error) {
            console.error('[InvitationService] Error al obtener invitaciones por persona:', error);
            return []; // Devolver array vacío en caso de error para evitar errores en cascada
        }
    },
    
    async createInvitation(invitationData) {
        if (!invitationData || !invitationData.organizationId || !invitationData.personId || !invitationData.invitedBy) {
            throw new Error('Faltan datos requeridos para crear la invitación');
        }
        
        try {
            console.log('[InvitationService] Creando invitación:', invitationData);
              // Preparar datos para la invitación
            const newInvitation = {
                organizationId: Number(invitationData.organizationId),
                personId: Number(invitationData.personId),
                invitedBy: Number(invitationData.invitedBy),
                status: 'Pending',
                invitedAt: new Date().toISOString()
            };
            
            // Configuración con headers apropiados para ASP.NET Core
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };
            
            // En ASP.NET Core, esta ruta sería algo como:
            // POST /api/invitations
            const response = await axios.post(`${baseURL}/invitations`, newInvitation, config);
            
            // Emitir evento para actualizar UI
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('invitation-created', { 
                    detail: { invitation: response.data } 
                }));
                
                // También actualizar notificaciones
                window.dispatchEvent(new CustomEvent('refresh-notifications'));
            }
            
            return response.data;
        } catch (error) {
            console.error('[InvitationService] Error al crear invitación:', error);
            throw error;
        }
    },/**
     * Obtiene las invitaciones para una persona específica
     * Compatible con ASP.NET Core y Azure
     * @param {string} personIdParam - ID de la persona o ID con parámetros extra
     * @returns {Promise<Array>} - Promesa con las invitaciones
     */
    async getByPersonId(personIdParam) {
        try {
            if (!personIdParam) {
                console.error('personIdParam es requerido');
                return [];
            }
            
            // Extraer ID base si contiene parámetros adicionales
            const baseId = personIdParam.split('?')[0];
            // Timestamp para evitar cache
            const timestamp = new Date().getTime();
            
            // Configuración para la petición HTTP
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                params: {
                    _t: timestamp  // Parámetro anti-cache
                }
            };
            
            // URL compatible con ASP.NET Core
            // En producción, ASP.NET Core usaría un endpoint como: api/invitations/person/{id}
            const apiUrl = `${baseURL}/invitations/person/${baseId}`;
            console.log(`[InvitationService] Obteniendo invitaciones para persona ID: ${baseId}`);
            
            try {
                // Intento principal usando el endpoint directo
                const response = await axios.get(apiUrl, config);
                
                // Verificar si la respuesta es un array
                const invitations = Array.isArray(response.data) ? response.data : [];
                console.log(`[InvitationService] Se obtuvieron ${invitations.length} invitaciones`);
                
                // Filtramos por status=Pending para asegurar consistencia
                return invitations.filter(inv => 
                    inv.status === 'Pending' || inv.status === 'PENDING'
                );
            } catch (directError) {
                console.warn("[InvitationService] Fallback: obteniendo todas las invitaciones");
                
                // Plan B: obtener todas las invitaciones y filtrar en cliente
                // En un entorno real con ASP.NET Core, esto no debería ser necesario
                const getAllUrl = `${baseURL}/invitations`;
                const response = await axios.get(getAllUrl, config);
                
                if (!Array.isArray(response.data)) {
                    console.error("[InvitationService] Respuesta inválida, no es un array");
                    return [];
                }
                
                // Filtrado de seguridad para asegurar que solo obtenemos las invitaciones correctas
                return response.data.filter(inv => 
                    String(inv.personId).trim() === String(baseId).trim() &&
                    (inv.status === 'Pending' || inv.status === 'PENDING')
                );
            }
        } catch (error) {
            console.error('[InvitationService] Error al obtener invitaciones:', error);
            return []; 
        }
    },      /**
     * Acepta una invitación y cambia su estado a 'Accepted'
     * Compatible con ASP.NET Core API
     * @param {string} id - El ID de la invitación
     * @returns {Promise<Object>} - Promesa con la invitación actualizada
     */    async accept(id) {
        if (!id) {
            throw new Error('El ID de invitación es requerido');
        }
        
        // Asegurarnos de que id sea un número
        const numericId = Number(id);
        
        try {
            console.log(`[InvitationService] Aceptando invitación con ID: ${numericId}`);
              // En ASP.NET Core, tendríamos un endpoint dedicado como:
            // PUT /api/invitations/{id}/accept
            // Por ahora simulamos ese comportamiento
            
            // Primero obtenemos la invitación actual para validar que existe
            const response = await axios.get(`${baseURL}/invitations/${numericId}`, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.data) {
                throw new Error(`No se encontró la invitación con ID: ${id}`);
            }
            
            const invitation = response.data;
            
            // Validar que la invitación está en estado pendiente
            if (invitation.status !== 'Pending' && invitation.status !== 'PENDING') {
                throw new Error('Solo se pueden aceptar invitaciones en estado pendiente');
            }
            
            // Preparar datos para la actualización
            const updateData = {
                ...invitation,
                status: 'Accepted',
                acceptedAt: new Date().toISOString()
            };
            
            // Configurar petición con headers apropiados
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };              // Actualizar la invitación
            const updateResponse = await axios.put(`${baseURL}/invitations/${numericId}`, updateData, config);
            
            // Después de actualizar, eliminar la invitación para evitar acumulación en la base de datos
            try {
                await axios.delete(`${baseURL}/invitations/${numericId}`, config);
                console.log(`[InvitationService] Invitación ${numericId} eliminada después de ser aceptada`);
            } catch (deleteError) {
                console.warn(`[InvitationService] No se pudo eliminar la invitación ${id} después de aceptarla:`, deleteError);
                // Continuamos aunque no se pueda eliminar, ya que la acción principal se completó
            }
            
            // Emitir evento para actualizar UI
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('invitation-accepted', { 
                    detail: { invitation: updateResponse.data } 
                }));
            }
            
            return updateResponse.data;
        } catch (error) {
            console.error('[InvitationService] Error al aceptar invitación:', error);
            throw error;
        }
    },
      /**
     * Rechaza una invitación y cambia su estado a 'Rejected'
     * Compatible con ASP.NET Core API
     * @param {string} id - El ID de la invitación
     * @returns {Promise<Object>} - Promesa con la invitación actualizada
     */    async reject(id) {
        if (!id) {
            throw new Error('El ID de invitación es requerido');
        }
        
        // Asegurarnos de que id sea un número
        const numericId = Number(id);
        
        try {
            console.log(`[InvitationService] Rechazando invitación con ID: ${numericId}`);
              // En ASP.NET Core, tendríamos un endpoint dedicado como:
            // PUT /api/invitations/{id}/reject
            
            // Primero obtenemos la invitación actual para validar que existe
            const response = await axios.get(`${baseURL}/invitations/${numericId}`, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.data) {
                throw new Error(`No se encontró la invitación con ID: ${id}`);
            }
            
            const invitation = response.data;
            
            // Validar que la invitación está en estado pendiente
            if (invitation.status !== 'Pending' && invitation.status !== 'PENDING') {
                throw new Error('Solo se pueden rechazar invitaciones en estado pendiente');
            }
            
            // Preparar datos para la actualización
            const updateData = {
                ...invitation,
                status: 'Rejected',
                rejectedAt: new Date().toISOString()
            };
            
            // Configurar petición con headers apropiados
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };              // Actualizar la invitación
            const updateResponse = await axios.put(`${baseURL}/invitations/${numericId}`, updateData, config);
            
            // Después de actualizar, eliminar la invitación para evitar acumulación en la base de datos
            try {
                await axios.delete(`${baseURL}/invitations/${numericId}`, config);
                console.log(`[InvitationService] Invitación ${numericId} eliminada después de ser rechazada`);            } catch (deleteError) {
                console.warn(`[InvitationService] No se pudo eliminar la invitación ${numericId} después de rechazarla:`, deleteError);
                // Continuamos aunque no se pueda eliminar, ya que la acción principal se completó
            }
            
            // Emitir evento para actualizar UI
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('invitation-rejected', { 
                    detail: { invitation: updateResponse.data } 
                }));
            }
            
            return updateResponse.data;
        } catch (error) {
            console.error('[InvitationService] Error al rechazar invitación:', error);
            throw error;
        }
    }
}