import axios from 'axios';

const propgmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL;

export class BaseService {
    constructor(resourceEndpoint = '/resources', options = {}) {
        this.resourceEndpoint = resourceEndpoint;
        this.serverBaseUrl = propgmsApiUrl;
        this.httpOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (options.create) this.create = this._create;
        if (options.getAll) this.getAll = this._getAll;
        if (options.getById) this.getById = this._getById;
        if (options.update) this.update = this._update;
        if (options.delete) this.delete = this._delete;
    }

    resourcePath() {
        return `${this.serverBaseUrl}${this.resourceEndpoint}`;
    }

    handleError(error) {
        if (error.response) {
            console.error(`Server error (${error.response.status}):`, error.response.data);
        } else if (error.request) {
            console.error('No response from server:', error.request);
        } else {
            console.error('Client-side error:', error.message);
        }
        throw new Error('Something went wrong. Please try again later.');
    }

    async _create(resource) {
        try {
            const res = await axios.post(this.resourcePath(), resource, this.httpOptions);
            return res.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async _delete(id) {
        try {
            const res = await axios.delete(`${this.resourcePath()}/${id}`, this.httpOptions);
            return res.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async _update(id, resource) {
        try {
            const res = await axios.put(`${this.resourcePath()}/${id}`, resource, this.httpOptions);
            return res.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async _getAll() {
        try {
            const res = await axios.get(this.resourcePath(), this.httpOptions);
            return res.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async _getById(id) {
        try {
            const res = await axios.get(`${this.resourcePath()}/${id}`, this.httpOptions);
            return res.data;
        } catch (error) {
            this.handleError(error);
        }
    }
}
