import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const changeProcessService = createService('/change-process', {
    create:                         { verb: HttpVerb.POST, path: 'by-project-id/:projectId', fullPath: true },
    getByProjectId:                 { verb: HttpVerb.GET, path: 'by-project-id/:projectId', fullPath: true },
    update:                         { verb: HttpVerb.PATCH, path: ':changeProcessId', fullPath: true }
})