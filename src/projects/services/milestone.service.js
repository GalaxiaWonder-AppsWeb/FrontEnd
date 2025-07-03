import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const milestoneService = createService('/milestone', {
    create:                         { verb: HttpVerb.POST },
    getByProjectId:                 { verb: HttpVerb.GET, path: '/by-project/:projectId' },
    delete:                         { verb: HttpVerb.DELETE, path: '/:id' },
})