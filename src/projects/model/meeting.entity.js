import {ProjectTeamMemberId} from "./project-team-member.entity.js";

export class Meeting {
    constructor({
                    id = new MeetingId(),
                    topic = '',
                    description = '',
                    startingDate = new Date(),
                    endingDate = new Date(),
                    calledBy = new ProjectTeamMemberId(),
                    participants = [],
                }){
        if (!topic || typeof topic !== 'string') {
            throw new Error('Topic is required and must be a non-empty string');
        }

        if (!(startingDate instanceof Date)) {
            throw new Error('Starting date must be a valid Date object');
        }

        if (!(endingDate instanceof Date)) {
            throw new Error('Ending date must be a valid Date object');
        }

        if (endingDate < startingDate) {
            throw new Error('Ending date cannot be earlier than starting date');
        }

        if (!(calledBy instanceof ProjectTeamMemberId)) {
            throw new Error('Called by must be a valid ProjectTeamMemberId object');
        }

        if (!Array.isArray(participants)) {
            throw new Error('Participants must be an array');
        }

        this.id = id;
        this.topic = topic;
        this.description = description;
        this.startingDate = startingDate;
        this.endingDate = endingDate;
        this.calledBy = calledBy;
        this.participants = participants;
    }

    getStartingDate() {
        return this.startingDate;
    }

    getEndingDate() {
        return this.endingDate;
    }

    updateTopic(newTopic) {
        if (!newTopic || typeof newTopic !== 'string') {
            throw new Error('Topic must be a non-empty string');
        }
        this.topic = newTopic;
    }

    updateStartingDate(newStartingDate) {
        if (!(newStartingDate instanceof Date)) {
            throw new Error('Starting date must be a valid Date object');
        }
        this.startingDate = newStartingDate;
    }

    updateEndingDate(newEndingDate) {
        if (!(newEndingDate instanceof Date)) {
            throw new Error('Ending date must be a valid Date object');
        }
        if (newEndingDate < this.startingDate) {
            throw new Error('Ending date cannot be earlier than starting date');
        }
        this.endingDate = newEndingDate;
    }

    updateCalledBy(newCalledBy) {
        if (!(newCalledBy instanceof ProjectTeamMemberId)) {
            throw new Error('Called by must be a valid ProjectTeamMemberId object');
        }
        this.calledBy = newCalledBy;
    }

    setParticipants(newParticipants) {
        if (!Array.isArray(newParticipants)) {
            throw new Error('Participants must be an array');
        }
        this.participants = newParticipants;
    }
}

export class MeetingId {
    constructor(value) {
        this.value = value;
    }

    toString() {
        return this.value;
    }
}
