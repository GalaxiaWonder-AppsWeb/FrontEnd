import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const OrganizationInvitationService = createService('/invitations', {
    getByOrganizationId: { verb: HttpVerb.GET, path: '', fullPath: true },
    invitePerson: { verb: HttpVerb.POST, path: '', fullPath: true },
    getByPersonId: { verb: HttpVerb.GET, path: '', fullPath: true }
})