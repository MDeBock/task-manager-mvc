export class StorageService {
    
    static KEY = 'pendientes';

    /**
     * Recupera todos los pendientes del localStorage.
     * Si no existen datos, retorna un array vacío.
     * @returns {Array} Array de objetos pendiente
     */
    static getPendientes() {
        const data = localStorage.getItem(this.KEY);
        if (!data) {
            return [];
        }
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al parsear datos de localStorage:', error);
            return [];
        }
    }

    /**
     * Guarda el array completo de pendientes en localStorage.
     * @param {Array} pendientes - Array de objetos a guardar
     */
    static savePendientes(pendientes) {
        try {
            const json = JSON.stringify(pendientes);
            localStorage.setItem(this.KEY, json);
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            throw new Error('No se pudo guardar la información localmente.');
        }
    }
}