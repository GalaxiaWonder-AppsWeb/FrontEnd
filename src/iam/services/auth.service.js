import axios from 'axios'

import {UserAccount} from "../model/user-account.entity.js";
import {Credentials} from "../model/credentials.entity.js";
import {Person} from "../model/person.entity.js";
import {UserType} from "../model/user-type.js";

const propgmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL

function toSignUpPayload(account, person) {
    return {
        username: account.email,
        password: account.password,
        userType: account.userType === 'Worker' ? 1 : 2, // Usa el ID numérico esperado por el backend
        firstName: person.name,
        lastName: person.lastName,
        email: person.email,
        phone: person.phoneNumber
    }
}

export class AuthService {
    constructor() {
        this.baseUrl = propgmsApiUrl
        this.httpOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }

    async findUserByEmail(email) {
        const res = await axios.get(`${this.baseUrl}/users`, {
            params: { email },
            headers: this.httpOptions.headers
        })
        return res.data[0] || null
    }

    async register(account, person) {
        try {
            const payload = {
                username: account.email,
                password: account.password,
                userType: account.userType === 'Worker' ? 0 : 1, // o usa tu mapping real
                firstName: person.name,
                lastName: person.lastName,
                email: person.email,
                phone: person.phoneNumber
            };

            const response = await axios.post(
                `${this.baseUrl}/api/v1/authentication/sign-up`,
                payload,
                this.httpOptions
            );

            return response.data;
        } catch (error) {
            this.handleError('Register', error);
        }
        /*
        try {
            const existingUser = await this.findUserByEmail(account.email)
            if (existingUser) {
                throw new Error('User already exists')
            }
            
            console.log("Datos de cuenta a registrar:", account.toJSON());
            console.log("Datos de persona a registrar:", person.toJSON());

            const personRes = await axios.post(
                `${this.baseUrl}/persons`,
                person.toJSON(),
                this.httpOptions
            )

            account.personId = Number(personRes.data.id)

            const createRes = await axios.post(
                `${this.baseUrl}/users`,
                account.toJSON(),
                this.httpOptions
            )

            return createRes.data
        } catch (error) {
            this.handleError('Register', error)
        }
        */
    }

    async login(credentials) {
        if (!(credentials instanceof Credentials)) {
            throw new Error('Invalid credentials object')
        }

        try {
            console.log('Login URL:', `${this.baseUrl}/api/v1/authentication/sign-in`); // 👈 Verificación útil

            const response = await axios.post(
                `${this.baseUrl}/api/v1/authentication/sign-in`,
                {
                    email: credentials.email,
                    password: credentials.password
                },
                this.httpOptions
            );

            const user = response.data;
            this.storeUser(user);
            console.log('[DEBUG] User returned by backend:', user);
            return user;
        } catch (error) {
            this.handleError('Login', error);
        }


        /*
        try {
            console.log(propgmsApiUrl);
            console.log(credentials);
            const res = await axios.get(`${this.baseUrl}/users`, {
                params: {
                    email: credentials.email,
                    password: credentials.password
                },
                headers: this.httpOptions.headers
            })
            console.log(res)
            if (res.data.length === 0) {
                throw new Error('Invalid email or password')
            }

            const user = res.data[0]
            this.storeUser(user)
            return user
        } catch (error) {
            this.handleError('Login', error)
        }
    }

    storeToken(token) {
        localStorage.setItem('token', token)
    }

    getToken() {
        return localStorage.getItem('token')
    }

    removeToken() {
        localStorage.removeItem('token')
    }

    logout() {
            */
    }
    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return Promise.resolve(true);
    }

    storeUser(user) {
        localStorage.setItem('user', JSON.stringify(user))
    }

    getCurrentUser() {
        const stored = localStorage.getItem('user')
        return stored ? JSON.parse(stored) : null
    }
    
    isAuthenticated() {
        return this.isLoggedIn();
    }

    isLoggedIn() {
        return !!this.getCurrentUser()
    }

    async updatePassword(userId, newPassword) {
        /* Este pedazo de código es para usar JWT y el token de autenticación
            try {
                const token = this.getToken();
                const response = await axios.get(`${this.baseUrl}/users/${userId}`, {
                    headers: {
                        ...this.httpOptions.headers,
                        'Authorization': `Bearer ${token}`
                    }
                });
                // ... resto igual
            } catch (error) {
                this.handleError('UpdatePassword', error);
            }
        */
        try {


            // Primero obtener el usuario completo
            const response = await axios.get(`${this.baseUrl}/users/${userId}`, this.httpOptions);
            const currentUser = response.data;
            
            if (!currentUser) {
                throw new Error('User not found');
            }
            
            // Actualizar solo la contraseña
            const updatedUser = {
                ...currentUser,
                password: newPassword
            };
            
            // Enviar la actualización
            const updateResponse = await axios.put(
                `${this.baseUrl}/users/${userId}`,
                updatedUser,
                this.httpOptions
            );
            
            console.log('Contraseña actualizada correctamente');
            return updateResponse.data;
        } catch (error) {
            this.handleError('UpdatePassword', error);
        }
    }

    handleError(context, error) {
        const msg = error.response?.data || error.message || 'Unexpected error'
        console.error(`[AuthService] ${context} error:`, msg)
        throw new Error(msg)
    }
}

// Exportar una instancia del servicio para usarlo en cualquier lugar
export const authService = new AuthService();
