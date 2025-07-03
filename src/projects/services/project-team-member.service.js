import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const projectTeamMemberService = createService('/project-team-member', {
    getProjectTeamMembersByProjectId: { verb: HttpVerb.GET, path: 'by-project-id/:projectId', fullPath: true },
    create:         { verb: HttpVerb.POST },
    delete:         { verb: HttpVerb.DELETE, path: ':id' }
})