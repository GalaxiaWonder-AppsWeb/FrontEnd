import {Meeting} from "./meeting.entity.js";

export class MeetingFactory {
    static create({
                      id,
                      topic,
                      description,
                      startingDate,
                      endingDate,
                      calledBy,
                      participants,
                  }) {
        return new Meeting({
            id,
            topic,
            description,
            startingDate,
            endingDate,
            calledBy,
            participants,
        });
    }
}
