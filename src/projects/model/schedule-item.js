// Una interfaz funcional que obliga al cumplimiento de los métodos
export class ScheduleItem {
    getStartDate() {
        throw new Error('Method getStartDate() must be implemented');
    }

    getEndDate() {
        throw new Error('Method getEndDate() must be implemented');
    }
}
