// src/services/organization-member.service.js
import axios from 'axios';
const propGmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL


export const organizationMemberService = {
    async getByOrganizationId(organizationId) {
        try {

            const response = await axios.get(propGmsApiUrl, {
                params: { organizationId }
            });
            console.log(response);
            return response.data;
        } catch (error) {
            console.error('Error al obtener los miembros:', error);
            throw error;
        }
    }
};
