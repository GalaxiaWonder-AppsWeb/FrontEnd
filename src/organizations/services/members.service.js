// src/services/organization-member.service.js
import axios from 'axios';

export const organizationMemberService = {
    async getByOrganizationId(organizationId) {
        try {

            const response = await axios.get(`http://localhost:3000/members`, {
                params: { organizationId }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener los miembros:', error);
            throw error;
        }
    }
};
