import axios from 'axios'
import {Credentials} from "../model/credentials.entity.js";

const propgmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL

// Define el mapeo local para los roles
const UserTypeIds = {
    ORGANIZATION_USER: 0, // equivale a TYPE_WORKER
    CLIENT_USER: 1        // equivale a TYPE_CLIENT
};

export class AuthService {
    constructor() {
        this.baseUrl = propgmsApiUrl
        this.httpOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }
    /*
    async findUserByEmail(email) {
        const res = await axios.get(`${this.baseUrl}/users`, {
            params: { email },
            headers: this.httpOptions.headers
        })
        return res.data[0] || null
    }
    */
    async register(account, person) {
        try {
            const payload = {
                username: account.email,
                password: account.password,
                userType: UserTypeIds[account.userType],
                firstName: person.name,
                lastName: person.lastName,
                email: person.email,
                phone: person.phoneNumber
            };

            const response = await axios.post(
                `${this.baseUrl}/authentication/sign-up`,
                payload,
                this.httpOptions
            );

            return response.data;
        } catch (error) {
            this.handleError('Register', error);
        }
    }

    async login(credentials) {
        if (!(credentials instanceof Credentials)) {
            throw new Error('Invalid credentials object')
        }

        try {
            console.log('Login URL:', `${this.baseUrl}/authentication/sign-in`); // 👈 Verificación útil

            const response = await axios.post(
                `${this.baseUrl}/authentication/sign-in`,
                {
                    email: credentials.email,
                    password: credentials.password
                },
                this.httpOptions
            );

            const user = response.data;
            this.storeUser(user);
            if (user.token) this.storeToken(user.token);
            console.log('[DEBUG] User returned by backend:', user);
            return user;
        } catch (error) {
            this.handleError('Login', error);
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
        /* Este pedazo de código es para usar JWT y el token de autenticación*/
        try {
            const token = this.getToken();
            const response = await axios.get(`${this.baseUrl}/api/v1/user_accounts/${userId}`, {
                headers: {
                    ...this.httpOptions.headers,
                    'Authorization': `Bearer ${token}`
                }
            });
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
                `${this.baseUrl}/api/v1/user_accounts/${userId}`,
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
        let msg = 'Unexpected error';
        if (error?.response?.data) {
            if (typeof error.response.data === 'string') {
                msg = error.response.data;
            } else if (typeof error.response.data === 'object') {
                msg = error.response.data.error || error.response.data.message || JSON.stringify(error.response.data);
            }
        } else if (error?.message) {
            msg = error.message;
        }
        console.error(`[AuthService] ${context} error:`, msg)
        throw new Error(msg)
    }

    getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

}

// Exportar una instancia del servicio para usarlo en cualquier lugar
export const authService = new AuthService();
