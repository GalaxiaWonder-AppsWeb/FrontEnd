/**
 * Configuración de API centralizada
 * Facilita la migración entre entornos (desarrollo, producción, Azure)
 */

// Base URL para las peticiones API
export const API_BASE_URL = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';

// Prefijo para API de ASP.NET Core (se usará en producción)
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || 'api';

// Versión de la API
export const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// URLs para endpoints específicos
export const API_ENDPOINTS = {
  // Organizaciones
  ORGANIZATIONS: `${API_BASE_URL}/organizations`,
  ORGANIZATION_BY_ID: (id) => `${API_BASE_URL}/organizations/${id}`,
  
  // Invitaciones
  INVITATIONS: `${API_BASE_URL}/invitations`,
  INVITATIONS_BY_PERSON_ID: (id) => `${API_BASE_URL}/invitations/person/${id}`,
  INVITATIONS_BY_ORG_ID: (id) => `${API_BASE_URL}/invitations/organization/${id}`,
  INVITATION_BY_ID: (id) => `${API_BASE_URL}/invitations/${id}`,
  
  // Miembros
  MEMBERS: `${API_BASE_URL}/members`,
  MEMBERS_BY_ORG_ID: (id) => `${API_BASE_URL}/members/organization/${id}`,
  MEMBERS_BY_PERSON_ID: (id) => `${API_BASE_URL}/members/person/${id}`,
  
  // Personas
  PERSONS: `${API_BASE_URL}/persons`,
  PERSON_BY_ID: (id) => `${API_BASE_URL}/persons/${id}`,
};

/**
 * Configuración de headers HTTP comunes para peticiones API
 */
export const API_HEADERS = {
  JSON: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  NO_CACHE: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
};

/**
 * Genera un timestamp para evitar cache en peticiones
 * @returns {Object} Objeto con parámetro timestamp
 */
export const getAntiCacheParam = () => ({
  _t: new Date().getTime()
});

/**
 * Prepara la configuración para peticiones axios con headers y parámetros comunes
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.noCache - Si se deben incluir headers anti-cache
 * @param {Object} options.params - Parámetros adicionales para la URL
 * @param {Object} options.headers - Headers adicionales
 * @returns {Object} Configuración para axios
 */
export const createRequestConfig = (options = {}) => {
  const config = {
    headers: { ...API_HEADERS.JSON },
    params: {}
  };
  
  if (options.noCache) {
    Object.assign(config.headers, API_HEADERS.NO_CACHE);
    Object.assign(config.params, getAntiCacheParam());
  }
  
  if (options.params) {
    Object.assign(config.params, options.params);
  }
  
  if (options.headers) {
    Object.assign(config.headers, options.headers);
  }
  
  return config;
};
