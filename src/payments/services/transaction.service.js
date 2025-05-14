import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const transactionService = createService('/transactions', {
    create:       { verb: HttpVerb.POST },                      // POST /transactions
    getById:      { verb: HttpVerb.GET, path: ':id' },          // GET /transactions/:id
    getByPayment: { verb: HttpVerb.GET, path: '', fullPath: true },  // GET /transactions/payment/:id
    update:       { verb: HttpVerb.PUT, path: ':id' },          // PUT /transactions/:id
    delete:       { verb: HttpVerb.DELETE, path: ':id' }        // DELETE /transactions/:id
})
