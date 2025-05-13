import { MeetingFactory } from './meeting.factory.js';
import { TaskFactory } from './task.factory.js';

export class ScheduleItemFactory {
    static create(type, data) {
        switch (type) {
            case 'meeting':
                return MeetingFactory.create(data);
            case 'task':
                return TaskFactory.create(data);
            default:
                throw new Error(`Unsupported ScheduleItem type: ${type}`);
        }
    }
}