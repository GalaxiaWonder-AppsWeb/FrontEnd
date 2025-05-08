// src/services/core/CreateService.js
import { BaseService } from './base.service.js';
import { HttpVerb } from './http-verb.js';

export function createService(resourceEndpoint, methodMap = {}) {
    const base = new BaseService(resourceEndpoint);
    const service = {};

    for (const [methodName, config] of Object.entries(methodMap)) {
        const { verb, path = '', fullPath = false } = config;

        service[methodName] = async (payload = null) => {
            const urlPath = fullPath ? path : path.replace(/^\/+/, '');
            switch (verb) {
                case HttpVerb.GET:
                    return (await base.get(urlPath)).data;
                case HttpVerb.POST:
                    return (await base.post(urlPath, payload)).data;
                case HttpVerb.PUT:
                    return (await base.put(urlPath, payload)).data;
                case HttpVerb.DELETE:
                    return (await base.delete(urlPath)).data;
                default:
                    throw new Error(`Unsupported HTTP verb: ${verb}`);
            }
        };
    }

    return service;
}
