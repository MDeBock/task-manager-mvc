/**
 * Utilidades para formateo de datos (Visualización en UI)
 * Transforma datos crudos (storage) a formato legible por humanos
 */
export class FormatUtils {

    /**
     * Convierte fecha "AAAA/MM/DD" a "DD/MM/AAAA"
     * @param {string} isoDate - Fecha en formato storage
     * @returns {string} Fecha formateada
     */
    static formatDate(isoDate) {
        if (!isoDate) return '';
        // Asumimos formato estricto AAAA/MM/DD
        const parts = isoDate.split('/');
        if (parts.length !== 3) return isoDate; // Retornar original si no coincide
        
        const [yyyy, mm, dd] = parts;
        return `${dd}/${mm}/${yyyy}`;
    }

    /**
     * Convierte fecha y hora "AAAA/MM/DD HH:MM" a "DD/MM/AAAA HH:MM"
     * @param {string} isoDateTime - FechaHora en formato storage
     * @returns {string} FechaHora formateada
     */
    static formatDateTime(isoDateTime) {
        if (!isoDateTime) return '';
        
        // Separar fecha y hora
        const [datePart, timePart] = isoDateTime.split(' ');
        
        if (!datePart) return isoDateTime;

        const formattedDate = this.formatDate(datePart);
        
        if (!timePart) return formattedDate;

        return `${formattedDate} ${timePart}`;
    }
}