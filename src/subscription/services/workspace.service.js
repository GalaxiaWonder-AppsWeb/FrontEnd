import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const workspaceService = createService('/workspaces', {
    create:         { verb: HttpVerb.POST },                     // POST /workspaces
    getById:        { verb: HttpVerb.GET, path: ':id' },         // GET /workspaces/:id
    update:         { verb: HttpVerb.PUT, path: ':id' },         // PUT /workspaces/:id
    delete:         { verb: HttpVerb.DELETE, path: ':id' },      // DELETE /workspaces/:id
    getByOrgId:     { verb: HttpVerb.GET, path: '', fullPath: true } // GET /workspaces/organization/:id
})