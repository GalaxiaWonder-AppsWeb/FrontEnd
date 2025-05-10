import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const subscriptionService = createService('/subscriptions', {
    create:         { verb: HttpVerb.POST },                     // POST /subscriptions
    getById:        { verb: HttpVerb.GET, path: ':id' },         // GET /subscriptions/:id
    update:         { verb: HttpVerb.PUT, path: ':id' },         // PUT /subscriptions/:id
    delete:         { verb: HttpVerb.DELETE, path: ':id' },      // DELETE /subscriptions/:id
    getByPersonId:  { verb: HttpVerb.GET, path: '', fullPath: true }  // GET /subscriptions/person/:id
})