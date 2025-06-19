import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const organizationMemberService = createService('/organization/members', {
    getAll:         { verb: HttpVerb.GET },
    getById:        { verb: HttpVerb.GET, path: ':id', fullPath: true },
    create:         { verb: HttpVerb.POST },
    update:         { verb: HttpVerb.PATCH, path: ':id' },
    delete:         { verb: HttpVerb.DELETE, path: ':id' },
    getByPersonId:  { verb: HttpVerb.GET, path: 'by-person-id/:personId', fullPath: true }
})