import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const organizationService = createService('/organizations', {
    getAll:         { verb: HttpVerb.GET },
    getById:        { verb: HttpVerb.GET, path: ':id', fullPath: true },
    getByCreatedBy: { verb: HttpVerb.GET , path: ':createdBy', fullPath: true },
    create:         { verb: HttpVerb.POST },
    update:         { verb: HttpVerb.PUT, path: ':id' },
    delete:         { verb: HttpVerb.DELETE, path: ':id' }
})
