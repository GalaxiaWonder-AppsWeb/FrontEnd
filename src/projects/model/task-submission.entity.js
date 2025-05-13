import {ProjectTeamMemberId} from "./project-team-member.entity.js";

export class TaskSubmission {
    constructor({
                    id = new TaskSubmissionId(),
                    submittedAt = new Date(),
                    notes = '',
                    reviewedAt = new Date(),
                    reviewedBy = new ProjectTeamMemberId(),
                    reviewedNotes = '',
                    submittedBy = new ProjectTeamMemberId()
                }) {
        if (!(id instanceof TaskSubmissionId) || !id.value) {
            throw new Error('id must be a valid TaskSubmissionId instance with a value')
        }

        if (!(submittedBy instanceof ProjectTeamMemberId) || !submittedBy.value) {
            throw new Error('submittedBy must be a valid ProjectTeamMemberId instance with a value')
        }

        if (!(reviewedBy instanceof ProjectTeamMemberId) || !reviewedBy.value) {
            throw new Error('reviewedBy must be a valid ProjectTeamMemberId instance with a value')
        }

        if (!(submittedAt instanceof Date)) {
            throw new Error('submittedAt must be a valid Date instance')
        }

        if (!(reviewedAt instanceof Date)) {
            throw new Error('reviewedAt must be a valid Date instance')
        }

        if (!notes || typeof notes !== 'string') {
            throw new Error('notes must be a string')
        }

        if (!reviewedNotes || typeof reviewedNotes !== 'string') {
            throw new Error('reviewedNotes must be a string')
        }

        this.id = id
        this.submittedAt = submittedAt
        this.notes = notes
        this.reviewedAt = reviewedAt
        this.reviewedBy = reviewedBy
        this.reviewedNotes = reviewedNotes
        this.submittedBy = submittedBy
    }

    toJSON() {
        return {
            id: this.id?.value ?? null,
            submittedAt: this.submittedAt,
            notes: this.notes,
            reviewedAt: this.reviewedAt,
            reviewedBy: this.reviewedBy?.value ?? null,
            reviewedNotes: this.reviewedNotes,
            submittedBy: this.submittedBy?.value ?? null
        }
    }
}

export class TaskSubmissionId {
    constructor(value) {
        // Si no se proporciona un valor, genera un UUID
        this.value = value || crypto.randomUUID();
    }
}