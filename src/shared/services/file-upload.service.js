import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// URL base para el API de archivos
const propgmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';

/**
 * Servicio para la gestión de archivos.
 * En desarrollo utiliza json-server para simular almacenamiento,
 * pero está diseñado para ser compatible con ASP.NET Core en producción.
 */
class FileUploadService {
    constructor() {
        this.baseUrl = propgmsApiUrl;
        this.filesEndpoint = '/files';
        this.httpOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    /**
     * Sube un archivo al servidor y devuelve la URL de acceso
     * @param {File|Blob|String} file Archivo o cadena base64 a subir
     * @param {String} fileName Nombre del archivo
     * @param {String} folder Carpeta donde guardar el archivo
     * @return {Promise<String>} URL del archivo subido
     */    async uploadFile(file, fileName = '', folder = 'profiles') {
        try {
            // Generar un nombre único para el archivo
            const uniqueFileName = this._generateUniqueFileName(fileName);
            const fileExtension = this._getFileExtension(file, fileName);
            const fullFileName = `${uniqueFileName}.${fileExtension}`;
            
            // En un entorno real, aquí se subiría el archivo al servidor
            // Para desarrollo, simplemente devolvemos el archivo como data URL
            let fileDataUrl;
            
            if (typeof file === 'string' && file.startsWith('data:')) {
                // Ya es data URL, lo usamos directamente
                fileDataUrl = file;
            } else if (file instanceof File || file instanceof Blob) {
                // Convertir File/Blob a data URL
                fileDataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            }
            
            // En un entorno de desarrollo, simplemente devolvemos la data URL
            // En producción, aquí se guardaría el archivo en un servidor y se devolvería la URL
            console.log('Archivo simulado cargado:', fullFileName);
            
            // Devolver la URL del archivo (en este caso, la data URL)
            return fileDataUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }
    
    /**
     * Obtiene un archivo por su ID
     * @param {String} fileId ID del archivo
     * @return {Promise<Object>} Datos del archivo
     */
    async getFileById(fileId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}${this.filesEndpoint}/${fileId}`,
                this.httpOptions
            );
            return response.data;
        } catch (error) {
            console.error('Error getting file:', error);
            throw error;
        }
    }
    
    /**
     * Convierte un archivo a base64
     * @param {File|Blob} file Archivo a convertir
     * @return {Promise<String>} Cadena base64
     */
    _fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }
    
    /**
     * Genera un nombre único para el archivo
     * @param {String} originalName Nombre original del archivo
     * @return {String} Nombre único
     */
    _generateUniqueFileName(originalName = '') {
        // Usar un UUID para garantizar unicidad
        return uuidv4();
    }
    
    /**
     * Determina la extensión del archivo
     * @param {File|Blob|String} file Archivo o cadena base64
     * @param {String} fileName Nombre del archivo
     * @return {String} Extensión del archivo
     */
    _getFileExtension(file, fileName) {
        // Si es un string base64
        if (typeof file === 'string' && file.startsWith('data:')) {
            const mime = file.split(';')[0].split(':')[1];
            return this._mimeToExtension(mime);
        }
        
        // Si es un File/Blob con tipo MIME
        if ((file instanceof File || file instanceof Blob) && file.type) {
            return this._mimeToExtension(file.type);
        }
        
        // Intentar extraer extensión del nombre de archivo
        if (fileName && fileName.includes('.')) {
            return fileName.split('.').pop().toLowerCase();
        }
        
        // Por defecto
        return 'jpg';
    }
    
    /**
     * Convierte un tipo MIME a una extensión de archivo
     * @param {String} mime Tipo MIME
     * @return {String} Extensión del archivo
     */
    _mimeToExtension(mime) {
        const mimeMap = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/svg+xml': 'svg'
        };
        
        return mimeMap[mime] || 'jpg';
    }
}

// Exportar una instancia del servicio para usarlo en cualquier lugar
export const fileUploadService = new FileUploadService();
