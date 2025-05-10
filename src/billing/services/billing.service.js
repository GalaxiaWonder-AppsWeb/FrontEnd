import {HttpVerb} from "../../shared/services/http-verb.js";
import {createService} from "../../shared/services/create.service.js";

export const billingService = createService('/invoices', {
    getAll:     { verb: HttpVerb.GET },
    getById:    { verb: HttpVerb.GET, path: ':id' },
    create:     { verb: HttpVerb.POST },
    update:     { verb: HttpVerb.PUT, path: ':id' },
    delete:     { verb: HttpVerb.DELETE, path: ':id' },
    getByPayerId: { verb: HttpVerb.GET, path: '', fullPath: true }
})