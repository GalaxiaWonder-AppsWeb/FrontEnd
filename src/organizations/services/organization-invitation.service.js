import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'
import axios from 'axios'

const baseURL = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000'

// Asegurarnos de que usamos las rutas correctas
export const OrganizationInvitationService = {
    ...createService('/invitations', {
        getByOrganizationId: { verb: HttpVerb.GET, path: 'organization/:id', fullPath: true },
        invitePerson: { verb: HttpVerb.POST, path: '', fullPath: false },
    }),
    
    /**
     * Método de utilidad para obtener invitaciones por organizationId
     * @param {string} organizationId - ID de la organización
     * @returns {Promise} - Promesa con las invitaciones
     */
    async getByOrgId(organizationId) {
        try {
            console.log(`Obteniendo invitaciones para organización ID: ${organizationId}`);
            return await this.getByOrganizationId({ id: organizationId });
        } catch (error) {
            console.error('Error al obtener invitaciones por organización:', error);
            return []; // Devolver array vacío en caso de error para evitar errores en cascada
        }
    },
      /**
     * Obtiene las invitaciones para una persona específica
     * @param {string} personIdParam - ID de la persona o ID con parámetros extra
     * @returns {Promise} - Promesa con las invitaciones
     */    async getByPersonId(personIdParam) {
        try {
            // Extraer ID base si contiene parámetros adicionales
            const baseId = personIdParam.split('?')[0];
            // Conservar cualquier parámetro adicional si existe
            const params = personIdParam.includes('?') ? personIdParam.substring(personIdParam.indexOf('?')) : '';
            
            console.log(`Obteniendo invitaciones para persona ID: ${baseId} con parámetros: ${params}`);
            
            // Intentar usar la ruta directa de la API para obtener invitaciones por personId
            const directUrl = `${baseURL}/invitations/person/${baseId}`;
            console.log("Intentando obtener invitaciones por ruta directa:", directUrl);
            
            try {
                // Primero intentar con la ruta directa
                const response = await axios.get(directUrl);
                const invitations = response.data;
                console.log(`Se obtuvieron ${invitations.length} invitaciones usando ruta directa`);
                return invitations;
            } catch (directError) {
                console.warn("No se pudieron obtener invitaciones por ruta directa, probando método alternativo", directError);
                
                // Método alternativo: obtener todas las invitaciones y filtrar manualmente
                const getAllUrl = `${baseURL}/invitations`;
                console.log("Obteniendo todas las invitaciones de:", getAllUrl);
                
                const response = await axios.get(getAllUrl);
                const allInvitations = response.data;
                console.log(`Se obtuvieron ${allInvitations.length} invitaciones en total`);
                
                // Filtrar manualmente las invitaciones por personId con verificación más flexible
                const filteredInvitations = allInvitations.filter(inv => 
                    String(inv.personId).trim() === String(baseId).trim()
                );
                console.log(`Invitaciones filtradas para personId ${baseId}:`, filteredInvitations);
                
                return filteredInvitations;
            }
        } catch (error) {
            console.error('Error al obtener invitaciones por persona:', error);
            return []; // Devolver array vacío en caso de error para evitar errores en cascada
        }
    },
      /**
     * Acepta una invitación y cambia su estado a 'Accepted'
     * @param {string} id - El ID de la invitación
     * @returns {Promise} - Promesa con la invitación actualizada
     */
    async accept(id) {
        try {
            console.log(`Aceptando invitación con ID: ${id}`);
            // Primero obtenemos la invitación actual
            const response = await axios.get(`${baseURL}/invitations/${id}`);
            const invitation = response.data;
            
            // Actualizamos su estado a 'Accepted'
            invitation.status = 'Accepted';
            invitation.acceptedAt = new Date().toISOString();
            
            console.log('Actualizando invitación a:', invitation);
            
            // Guardamos los cambios
            const updateResponse = await axios.put(`${baseURL}/invitations/${id}`, invitation);
            
            console.log('Invitación aceptada:', updateResponse.data);
            return updateResponse.data;
        } catch (error) {
            console.error('Error al aceptar invitación:', error);
            throw error;
        }
    },
      /**
     * Rechaza una invitación y cambia su estado a 'Rejected'
     * @param {string} id - El ID de la invitación
     * @returns {Promise} - Promesa con la invitación actualizada
     */
    async reject(id) {
        try {
            console.log(`Rechazando invitación con ID: ${id}`);
            
            // Primero obtenemos la invitación actual
            const response = await axios.get(`${baseURL}/invitations/${id}`);
            const invitation = response.data;
            
            // Actualizamos su estado a 'Rejected'
            invitation.status = 'Rejected';
            invitation.rejectedAt = new Date().toISOString();
            
            console.log('Actualizando invitación a:', invitation);
            
            // Guardamos los cambios
            const updateResponse = await axios.put(`${baseURL}/invitations/${id}`, invitation);
            
            console.log('Invitación rechazada:', updateResponse.data);
            return updateResponse.data;
        } catch (error) {
            console.error('Error al rechazar invitación:', error);
            throw error;
        }
    }
}