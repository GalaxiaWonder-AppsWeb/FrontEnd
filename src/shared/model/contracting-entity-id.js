export class ContractingEntityId {
    constructor(value) {
        // Si no se proporciona un valor, genera un UUID
        this.value = value || crypto.randomUUID();
    }
}