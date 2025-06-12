import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'
import { CacheService } from '../../shared/services/cache.service.js'
import axios from 'axios'

// Crear el servicio base
const baseService = createService('/organizations', {
    getAll:         { verb: HttpVerb.GET },
    getById:        { verb: HttpVerb.GET, path: ':id', fullPath: true },
    getByCreatedBy: { verb: HttpVerb.GET },
    create:         { verb: HttpVerb.POST },
    update:         { verb: HttpVerb.PUT, path: ':id' },
    delete:         { verb: HttpVerb.DELETE, path: ':id' }
});

// Crear versión con caché
export const organizationService = {    // Mantener métodos originales
    ...baseService,
    
    // Sobreescribir getById para usar caché
    getById: async (params) => {
        const id = params.id || params;
        // Asegurar que id se maneja como número para consistencia
        const numericId = typeof id === 'number' ? id : Number(id);
        const cacheKey = `organization_${numericId}`;
        
        return CacheService.getData(
            cacheKey,
            () => baseService.getById(numericId)
        );
    },
    
    // Al crear, actualizar o eliminar, invalidar caché relacionada
    create: async (data) => {
        const result = await baseService.create(data);
        CacheService.invalidateAll(); // Invalidar caché después de crear
        return result;
    },
    
    update: async (data) => {
        const id = data.id;
        const result = await baseService.update(data);
        CacheService.invalidate(`organization_${id}`); // Invalidar caché específica
        return result;
    },
    
    delete: async (params) => {
        const id = params.id || params;
        const result = await baseService.delete(id);
        CacheService.invalidate(`organization_${id}`); // Invalidar caché específica
        CacheService.invalidateAll(); // También invalidar listas que podrían contener esta organización
        return result;
    }
}
