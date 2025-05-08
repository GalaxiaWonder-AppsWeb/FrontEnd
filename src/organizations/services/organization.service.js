import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const organizationService = createService('/organizations', {
    getAll:         { verb: HttpVerb.GET },
    getById:        { verb: HttpVerb.GET, path: ':id' },
    create:         { verb: HttpVerb.POST },
    update:         { verb: HttpVerb.PUT, path: ':id' },
    delete:         { verb: HttpVerb.DELETE, path: ':id' }
})
