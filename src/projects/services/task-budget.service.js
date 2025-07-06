import { createService } from '../../shared/services/create.service.js'
import { HttpVerb } from '../../shared/services/http-verb.js'

export const taskBudgetService = createService('/projects', {
    getTotalTaskBudget:                { verb: HttpVerb.GET, path: ':projectId/total-task-budget' }

})