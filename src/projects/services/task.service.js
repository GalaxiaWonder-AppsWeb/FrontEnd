import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const taskService = createService('/task', {
    create:                         { verb: HttpVerb.POST },
    getByMilestoneId:               { verb: HttpVerb.GET, path: '/by-milestone-id/:milestoneId' },
    getByPersonIdAndMilestoneId:    { verb: HttpVerb.GET, path: '/by-person-id-and-milestone-id/:personId/:milestoneId', fullPath: true },
    delete:                         { verb: HttpVerb.DELETE, path: '/:id' },
    update:                         { verb: HttpVerb.PATCH, path: '/:id' }
})