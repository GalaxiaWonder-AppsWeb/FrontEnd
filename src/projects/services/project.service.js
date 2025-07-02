import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const projectService = createService('/project', {
    getAll:         { verb: HttpVerb.GET },
    getById:        { verb: HttpVerb.GET, path: ':id', fullPath: true },
    getByCreatedBy: { verb: HttpVerb.GET },
    getByContractingEntity: { verb: HttpVerb.GET, path: 'contracting-entity/:id', fullPath: true },
    getByPersonAndOrganizationId: { verb: HttpVerb.GET, path: 'by-person-and-organization/:personId/:organizationId', fullPath: true },
    create:         { verb: HttpVerb.POST },
    updateName:         { verb: HttpVerb.PATCH, path: ':id/name' },
    updateDescription:  { verb: HttpVerb.PATCH, path: ':id/description' },
    updateDateRange: { verb: HttpVerb.PATCH, path: ':projectId/date-range' },
    delete:         { verb: HttpVerb.DELETE, path: ':id' }
})