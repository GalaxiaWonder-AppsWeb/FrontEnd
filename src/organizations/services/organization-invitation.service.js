import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const organizationInvitationService = createService('/organization/invitations', {
    getAll:         { verb: HttpVerb.GET },
    getById:        { verb: HttpVerb.GET, path: ':id', fullPath: true },
    invite:         { verb: HttpVerb.POST },
    accept:         { verb: HttpVerb.PATCH, path: ':id/accept', fullPath: true },
    reject:         { verb: HttpVerb.PATCH, path: ':id/reject', fullPath: true },
});