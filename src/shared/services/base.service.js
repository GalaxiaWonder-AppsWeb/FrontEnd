import axios from 'axios';

// Si no está definida la variable de entorno, usar un valor por defecto
const propGmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';

export class BaseService {
    constructor(resourceEndpoint) {
        // Asegurarse de que la URL base no termine con / y resourceEndpoint comience con /
        const baseUrl = propGmsApiUrl.endsWith('/') ? propGmsApiUrl.slice(0, -1) : propGmsApiUrl;
        const endpoint = resourceEndpoint.startsWith('/') ? resourceEndpoint : `/${resourceEndpoint}`;
        
        this.url = `${baseUrl}${endpoint}`;
        console.log(`BaseService initialized with URL: ${this.url}`);
    }    get(path = '', params = null) {
        // Asegurarse de combinar URL base y path correctamente sin dobles barras
        const cleanPath = path ? (path.startsWith('/') ? path.substring(1) : path) : '';
        const cleanUrl = cleanPath ? `${this.url}/${cleanPath}` : this.url;
        console.log(`GET request to: ${cleanUrl}`, params);
        return axios.get(cleanUrl, { params })
            .then(response => {
                console.log(`Success GET response from ${cleanUrl}:`, response.status);
                return response;
            })
            .catch(error => {
                console.error(`Error in GET request to ${cleanUrl}:`, error);
                
                // Manejar errores HTTP específicos
                if (error.response) {
                    // Si es un error 404, intentar con una ruta alternativa sin prefijo api/v1
                    if (error.response.status === 404 && cleanUrl.includes('/api/v1')) {
                        const alternativeUrl = cleanUrl.replace('/api/v1', '');
                        console.log(`Trying alternative URL: ${alternativeUrl}`);
                        return axios.get(alternativeUrl, { params })
                            .then(response => {
                                console.log(`Success GET response from alternative URL ${alternativeUrl}:`, response.status);
                                return response;
                            })
                            .catch(altError => {
                                console.error(`Error in GET request to alternative URL ${alternativeUrl}:`, altError);
                                throw altError;
                            });
                    }
                    
                    // Si es un error 401 o 403, podría ser un problema de autenticación
                    if (error.response.status === 401 || error.response.status === 403) {
                        console.warn(`Authentication error (${error.response.status}) for ${cleanUrl}`);
                    }
                }
                
                throw error;
            });
    }    post(path = '', data) {
        // Asegurarse de combinar URL base y path correctamente sin dobles barras
        const cleanPath = path ? (path.startsWith('/') ? path.substring(1) : path) : '';
        const cleanUrl = cleanPath ? `${this.url}/${cleanPath}` : this.url;
        console.log(`POST request to: ${cleanUrl}`, data);
        return axios.post(cleanUrl, data)
            .then(response => {
                console.log(`Success POST response from ${cleanUrl}:`, response.status);
                return response;
            })
            .catch(error => {
                console.error(`Error in POST request to ${cleanUrl}:`, error);
                if (error.response) {
                    console.error('Status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                throw error;
            });
    }    put(path = '', data) {
        // Asegurarse de combinar URL base y path correctamente sin dobles barras
        const cleanPath = path ? (path.startsWith('/') ? path.substring(1) : path) : '';
        const cleanUrl = cleanPath ? `${this.url}/${cleanPath}` : this.url;
        console.log(`PUT request to: ${cleanUrl}`, data);
        return axios.put(cleanUrl, data)
            .then(response => {
                console.log(`Success PUT response from ${cleanUrl}:`, response.status);
                return response;
            })
            .catch(error => {
                console.error(`Error in PUT request to ${cleanUrl}:`, error);
                if (error.response) {
                    console.error('Status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                throw error;
            });
    }
      patch(path = '', data) {
        // Asegurarse de combinar URL base y path correctamente sin dobles barras
        const cleanPath = path ? (path.startsWith('/') ? path.substring(1) : path) : '';
        const cleanUrl = cleanPath ? `${this.url}/${cleanPath}` : this.url;
        console.log(`PATCH request to: ${cleanUrl}`, data);
        return axios.patch(cleanUrl, data)
            .then(response => {
                console.log(`Success PATCH response from ${cleanUrl}:`, response.status);
                return response;
            })
            .catch(error => {
                console.error(`Error in PATCH request to ${cleanUrl}:`, error);
                if (error.response) {
                    console.error('Status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                throw error;
            });
    }delete(path = '') {
        // Asegurarse de combinar URL base y path correctamente sin dobles barras
        const cleanPath = path ? (path.startsWith('/') ? path.substring(1) : path) : '';
        const cleanUrl = cleanPath ? `${this.url}/${cleanPath}` : this.url;
        console.log(`DELETE request to: ${cleanUrl}`);
        return axios.delete(cleanUrl)
            .then(response => {
                console.log(`Success DELETE response from ${cleanUrl}:`, response.status);
                return response;
            })
            .catch(error => {
                console.error(`Error in DELETE request to ${cleanUrl}:`, error);
                if (error.response) {
                    console.error('Status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                throw error;
            });
    }
}
