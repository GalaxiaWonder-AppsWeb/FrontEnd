// src/services/core/CreateService.js
import { BaseService } from './base.service.js';
import { HttpVerb } from './http-verb.js';

// Verifica si es un string o número
function isPrimitive(value) {
    return typeof value === 'string' || typeof value === 'number';
}

// Quita el prefijo "/" si no es ruta completa
function extractPath(path, fullPath) {
    return fullPath ? path : path.replace(/^\/+/, '');
}

// Extrae .value de value objects o retorna el valor directo
function extractParamValue(val) {
    if (val && typeof val === 'object' && 'value' in val) {
        return val.value;
    }
    return val;
}

// Reemplaza los :param en el path con valores del payload
function replacePathParams(pathTemplate, payload) {
    return pathTemplate.replace(/:([a-zA-Z]+)/g, (_, key) => {
        const val = payload[key];
        const extracted = extractParamValue(val);
        return extracted ?? `:${key}`;
    });
}

// Elimina el campo id del cuerpo del payload (solo para PUT/DELETE)
function removeIdFromPayload(payload) {
    const { id, ...rest } = payload;
    return rest;
}

// Devuelve la función adecuada para el verbo HTTP
function buildRequestHandler(verb, base, urlPath) {
    switch (verb) {
        case HttpVerb.GET:
            return (params = {}) => base.get(urlPath, params).then(res => res.data);
        case HttpVerb.POST:
            return (data) => base.post(urlPath, data).then(res => res.data);
        case HttpVerb.PUT:
            return (data) => base.put(urlPath, data).then(res => res.data);
        case HttpVerb.PATCH:
            return (data) => base.patch(urlPath, data).then(res => res.data);
        case HttpVerb.DELETE:
            return () => base.delete(urlPath).then(res => res.data);
        default:
            throw new Error(`Unsupported HTTP verb: ${verb}`);
    }
}

function addQueryParams(url, params) {
    const queryParams = new URLSearchParams(params).toString();
    return queryParams ? `${url}?${queryParams}` : url;
}

export function createService(resourceEndpoint, methodMap = {}) {
    const base = new BaseService(resourceEndpoint);
    const service = {};

    for (const [methodName, config] of Object.entries(methodMap)) {
        const { verb, path = '', fullPath = false } = config;

        service[methodName] = async (payload = null, queryParams = {}) => {
            let urlPath = extractPath(path, fullPath);
            
            console.log(`[${methodName}] Creating request with path: ${urlPath}, payload:`, payload);

            if (isPrimitive(payload)) {
                console.log(`[${methodName}] Processing primitive payload`);
                urlPath = urlPath.replace(':id', payload);
                payload = null;
            } else if (typeof payload === 'object' && payload !== null) {
                console.log(`[${methodName}] Processing object payload`);
                console.log(`[${methodName}] Path before replacement: ${urlPath}`);
                urlPath = replacePathParams(urlPath, payload);
                console.log(`[${methodName}] Path after replacement: ${urlPath}`);

                if (verb !== HttpVerb.POST) {
                    payload = removeIdFromPayload(payload);
                }
            }

            const fullUrl = addQueryParams(urlPath, queryParams);

            const handler = buildRequestHandler(verb, base, fullUrl);
            return handler(payload);
        };
    }

    return service;
}
