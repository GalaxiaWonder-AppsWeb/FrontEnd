export class Person {
    constructor(name, lastName, email, phoneNumber, profession = '', professionalId = '') {
        this.name = name;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.profession = profession;
        this.professionalId = professionalId;
    }
}
