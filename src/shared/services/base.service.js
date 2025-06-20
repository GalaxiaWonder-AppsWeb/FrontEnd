import axios from 'axios';
import { authService } from '../../iam/services/auth.service.js';

// Si no está definida la variable de entorno, usar un valor por defecto
const propGmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';

export class BaseService {
    constructor(resourceEndpoint) {
        // Asegurarse de que la URL base no termine con / y resourceEndpoint comience con /
        const baseUrl = propGmsApiUrl.endsWith('/') ? propGmsApiUrl.slice(0, -1) : propGmsApiUrl;
        const endpoint = resourceEndpoint.startsWith('/') ? resourceEndpoint : `/${resourceEndpoint}`;
        
        this.url = `${baseUrl}${endpoint}`;
    }

    /**
     * Construye una URL limpia combinando la URL base y la ruta proporcionada
     * @param {string} path - Ruta a combinar
     * @returns {string} - URL limpia
     */
    _buildUrl(path) {
        const cleanPath = path ? (path.startsWith('/') ? path.substring(1) : path) : '';
        return cleanPath ? `${this.url}/${cleanPath}` : this.url;
    }

    /**
     * Maneja la respuesta exitosa de una solicitud HTTP
     * @param {string} method - Método HTTP (GET, POST, etc.)
     * @param {string} url - URL de la solicitud
     * @param {Object} response - Respuesta de axios
     * @returns {Object} - Respuesta original
     */
    _handleSuccess(method, url, response) {
        return response;
    }

    /**
     * Maneja errores de solicitudes HTTP
     * @param {string} method - Método HTTP (GET, POST, etc.)
     * @param {string} url - URL de la solicitud
     * @param {Error} error - Error capturado
     * @param {Object} options - Opciones adicionales como params para reintentos
     * @throws {Error} - Relanza el error después de registrarlo
     */
    _handleError(method, url, error, options = {}) {
        console.error(`Error in ${method} request to ${url}:`, error);
        
        if (error.response) {
            // Si es un error 404 en GET y la URL contiene '/api/v1', intentar con ruta alternativa
            if (method === 'GET' && error.response.status === 404 && url.includes('/api/v1')) {
                const alternativeUrl = url.replace('/api/v1', '');
                return axios.get(alternativeUrl, { params: options.params })
                    .then(response => this._handleSuccess('GET', alternativeUrl, response))
                    .catch(altError => {
                        console.error(`Error in GET request to alternative URL ${alternativeUrl}:`, altError);
                        throw altError;
                    });
            }
            
            // Si es un error 401 o 403, podría ser un problema de autenticación
            if (error.response.status === 401 || error.response.status === 403) {
                console.warn(`Authentication error (${error.response.status}) for ${url}`);
            }
            
            console.error('Status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        
        throw error;
    }

    /**
     * Realiza una solicitud HTTP GET
     * @param {string} path - Ruta a concatenar a la URL base
     * @param {Object} params - Parámetros de consulta
     * @returns {Promise<Object>} - Promesa con la respuesta
     */
    get(path = '', params = null) {
        const cleanUrl = this._buildUrl(path);
        return axios.get(cleanUrl, { params, headers: this._getAuthHeaders() })
            .then(response => this._handleSuccess('GETTER', cleanUrl, response))
            .catch(error => this._handleError('GET', cleanUrl, error, { params }));
    }

    /**
     * Realiza una solicitud HTTP POST
     * @param {string} path - Ruta a concatenar a la URL base
     * @param {Object} data - Datos a enviar en el cuerpo
     * @returns {Promise<Object>} - Promesa con la respuesta
     */
    post(path = '', data) {
        const cleanUrl = this._buildUrl(path);
        return axios.post(cleanUrl, data, {
            headers: this._getAuthHeaders()
        })
            .then(response => this._handleSuccess('POST', cleanUrl, response))
            .catch(error => this._handleError('POST', cleanUrl, error));
    }

    /**
     * Realiza una solicitud HTTP PUT
     * @param {string} path - Ruta a concatenar a la URL base
     * @param {Object} data - Datos a enviar en el cuerpo
     * @returns {Promise<Object>} - Promesa con la respuesta
     */
    put(path = '', data) {
        const cleanUrl = this._buildUrl(path);
        return axios.put(cleanUrl, data, {
            headers: this._getAuthHeaders()
        })
            .then(response => this._handleSuccess('PUT', cleanUrl, response))
            .catch(error => this._handleError('PUT', cleanUrl, error));
    }

    /**
     * Realiza una solicitud HTTP PATCH
     * @param {string} path - Ruta a concatenar a la URL base
     * @param {Object} data - Datos a enviar en el cuerpo
     * @returns {Promise<Object>} - Promesa con la respuesta
     */
    patch(path = '', data) {
        const cleanUrl = this._buildUrl(path);
        return axios.patch(cleanUrl, data, {
            headers: this._getAuthHeaders()
        })
            .then(response => this._handleSuccess('PATCH', cleanUrl, response))
            .catch(error => this._handleError('PATCH', cleanUrl, error));
    }

    /**
     * Realiza una solicitud HTTP DELETE
     * @param {string} path - Ruta a concatenar a la URL base
     * @returns {Promise<Object>} - Promesa con la respuesta
     */
    delete(path = '') {
        const cleanUrl = this._buildUrl(path);
        return axios.delete(cleanUrl, {
            headers: this._getAuthHeaders()
        })
            .then(response => this._handleSuccess('DELETE', cleanUrl, response))
            .catch(error => this._handleError('DELETE', cleanUrl, error));
    }

    _getAuthHeaders() {
        const token = authService.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        }
    }
}
