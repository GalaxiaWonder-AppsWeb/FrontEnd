
export class TaskSubmission {
    constructor({
                    id = null,
                    submittedAt = new Date(),
                    notes = '',
                    reviewedAt = new Date(),
                    reviewedBy = null,
                    reviewedNotes = '',
                    submittedBy = null
                }) {

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

        this.id = typeof id === 'number' ? id : null
        this.submittedAt = submittedAt
        this.notes = notes
        this.reviewedAt = reviewedAt
        this.reviewedBy = typeof reviewedBy === 'number' ? reviewedBy : null
        this.reviewedNotes = reviewedNotes
        this.submittedBy = typeof submittedBy === 'number' ? submittedBy : null;
    }

    toJSON() {
        return {
            id: this.id,
            submittedAt: this.submittedAt,
            notes: this.notes,
            reviewedAt: this.reviewedAt,
            reviewedBy: this.reviewedBy,
            reviewedNotes: this.reviewedNotes,
            submittedBy: this.submittedBy
        }
    }
}