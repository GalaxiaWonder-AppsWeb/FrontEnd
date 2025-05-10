import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const organizationMemberService = createService('/members', {
    create:         { verb: HttpVerb.POST },
    delete:         { verb: HttpVerb.DELETE, path: ':id' },
    getByOrgId:     { verb: HttpVerb.GET, path: '', fullPath: true },
    getByPersonAndOrgId:  { verb: HttpVerb.GET, path: '', fullPath: true }
})