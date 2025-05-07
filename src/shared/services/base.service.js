import axios from 'axios';

export class BaseService {
    constructor(resourceEndpoint) {
        this.url = `${import.meta.env.VITE_PROPGMS_API_URL}${resourceEndpoint}`;
    }

    get(path = '') {
        return axios.get(`${this.url}/${path}`.replace(/\/+$/, ''));
    }

    post(path = '', data) {
        return axios.post(`${this.url}/${path}`.replace(/\/+$/, ''), data);
    }

    put(path = '', data) {
        return axios.put(`${this.url}/${path}`.replace(/\/+$/, ''), data);
    }

    delete(path = '') {
        return axios.delete(`${this.url}/${path}`.replace(/\/+$/, ''));
    }
}
