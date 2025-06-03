import axios from 'axios';

// Si no está definida la variable de entorno, usar un valor por defecto
const propGmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';

export class BaseService {
    constructor(resourceEndpoint) {
        this.url = `${propGmsApiUrl}${resourceEndpoint}`;
        console.log(`BaseService initialized with URL: ${this.url}`);
    }    get(path = '', params = null) {
        const cleanUrl = `${this.url}/${path}`.replace(/\/+$/, '');
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
    }

    post(path = '', data) {
        const cleanUrl = `${this.url}/${path}`.replace(/\/+$/, '');
        console.log(`POST request to: ${cleanUrl}`, data);
        return axios.post(cleanUrl, data)
            .then(response => {
                console.log(`Success POST response from ${cleanUrl}:`, response.status);
                return response;
            })
            .catch(error => {
                console.error(`Error in POST request to ${cleanUrl}:`, error);
                throw error;
            });
    }    put(path = '', data) {
        const cleanUrl = `${this.url}/${path}`.replace(/\/+$/, '');
        console.log(`PUT request to: ${cleanUrl}`, data);
        return axios.put(cleanUrl, data)
            .then(response => {
                console.log(`Success PUT response from ${cleanUrl}:`, response.status);
                return response;
            })
            .catch(error => {
                console.error(`Error in PUT request to ${cleanUrl}:`, error);
                throw error;
            });
    }
    
    patch(path = '', data) {
        const cleanUrl = `${this.url}/${path}`.replace(/\/+$/, '');
        console.log(`PATCH request to: ${cleanUrl}`, data);
        return axios.patch(cleanUrl, data)
            .then(response => {
                console.log(`Success PATCH response from ${cleanUrl}:`, response.status);
                return response;
            })
            .catch(error => {
                console.error(`Error in PATCH request to ${cleanUrl}:`, error);
                throw error;
            });
    }

    delete(path = '') {
        const cleanUrl = `${this.url}/${path}`.replace(/\/+$/, '');
        console.log(`DELETE request to: ${cleanUrl}`);
        return axios.delete(cleanUrl)
            .then(response => {
                console.log(`Success DELETE response from ${cleanUrl}:`, response.status);
                return response;
            })
            .catch(error => {
                console.error(`Error in DELETE request to ${cleanUrl}:`, error);
                throw error;
            });
    }
}
