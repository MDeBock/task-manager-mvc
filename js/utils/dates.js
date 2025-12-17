/**
 * Utilidades para manejo, cálculo y generación de fechas
 * Formato interno de almacenamiento: AAAA/MM/DD HH:MM
 */
export class DatesUtils {

    /**
     * Retorna la fecha actual en formato AAAA/MM/DD (para fechaCreacion)
     * @returns {string}
     */
    static getTodayDateString() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}/${mm}/${dd}`;
    }

    /**
     * Retorna la fecha y hora actual en formato AAAA/MM/DD HH:MM
     * @returns {string}
     */
    static getNowDateTimeString() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
    }

    /**
     * Calcula el tiempo restante de un pendiente activo.
     * @param {Object} pendiente 
     * @returns {Object} { texto: "HH:MM" o "-HH:MM", excedido: boolean }
     */
    static calcularTiempoRestante(pendiente) {
        if (!pendiente.fechaActivacion || !pendiente.plazoHoras) {
            return { texto: "00:00", excedido: false };
        }

        // 1. Parsear fecha de activación (string AAAA/MM/DD HH:MM)
        // Reemplazamos / por - para asegurar compatibilidad con constructor Date estándar
        const activacionStr = pendiente.fechaActivacion.replace(/\//g, '-').replace(' ', 'T');
        const fechaActivacion = new Date(activacionStr);
        
        // 2. Calcular fecha de vencimiento
        // plazoHoras es entero, sumamos milisegundos
        const plazoMs = pendiente.plazoHoras * 60 * 60 * 1000;
        const fechaVencimiento = new Date(fechaActivacion.getTime() + plazoMs);
        
        // 3. Calcular diferencia con ahora
        const ahora = new Date();
        let diffMs = fechaVencimiento - ahora;
        
        const excedido = diffMs < 0;
        
        // Trabajamos con valor absoluto para el formateo
        diffMs = Math.abs(diffMs);

        // 4. Convertir a HH:MM (puede superar 24h)
        const totalMinutes = Math.floor(diffMs / 1000 / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Formateo con ceros a la izquierda
        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');

        let texto = `${hh}:${mm}`;
        if (excedido) {
            texto = `-${texto}`;
        }

        return { texto, excedido };
    }
}