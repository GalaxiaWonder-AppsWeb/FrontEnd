import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const recurringPaymentAgreementService = createService('/recurring-agreements', {
    create:        { verb: HttpVerb.POST },                      // POST /recurring-agreements
    getById:       { verb: HttpVerb.GET, path: ':id' },          // GET /recurring-agreements/:id
    update:        { verb: HttpVerb.PUT, path: ':id' },          // PUT /recurring-agreements/:id
    getByPersonId: { verb: HttpVerb.GET, path: '', fullPath: true }    // GET /recurring-agreements/person/:id
})