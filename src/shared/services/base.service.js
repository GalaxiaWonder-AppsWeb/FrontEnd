import axios from 'axios';

const propGmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL

export class BaseService {
    constructor(resourceEndpoint) {
        this.url = `${propGmsApiUrl}${resourceEndpoint}`;
    }

    get(path = '', params = null) {
        const cleanUrl = `${this.url}/${path}`.replace(/\/+$/, '')
        return axios.get(cleanUrl, { params })
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
