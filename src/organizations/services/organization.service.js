import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const organizationService = createService('/organization', {
    getAll:         { verb: HttpVerb.GET },
    getById:        { verb: HttpVerb.GET, path: ':id', fullPath: true },
    getAllInvitationByPersonId: { verb: HttpVerb.GET, path: 'persons/:id/invitations' },
    create:         { verb: HttpVerb.POST },
    update:         { verb: HttpVerb.PATCH, path: ':id' },
    delete:         { verb: HttpVerb.DELETE, path: ':id' },
    getByPersonId:  { verb: HttpVerb.GET, path: 'by-member-person-id/:id', fullPath: true },
    getAllMembers:  { verb: HttpVerb.GET, path: ':id/members', fullPath: true },
    getByPersonAndOrganizationId: { verb: HttpVerb.GET, path: ':organizationId/team-members/:personId/projects', fullPath: true },
})