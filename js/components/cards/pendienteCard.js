import { DatesUtils } from '../../utils/dates.js';
import { FormatUtils } from '../../utils/format.js';

export class PendienteCard {
    
    /**
     * Genera el elemento DOM de la tarjeta para un pendiente
     * @param {Object} pendiente - Objeto de datos del pendiente
     * @returns {HTMLElement} - Elemento div con la tarjeta
     */
    static render(pendiente) {
        const card = document.createElement('div');
        card.className = 'pendiente-card'; // Clase definida en cards.css

        // 1. Determinar clases y textos de Prioridad
        const priorityClass = `badge-priority-${pendiente.prioridad}`; // alta, media, baja
        const priorityLabel = pendiente.prioridad.charAt(0).toUpperCase() + pendiente.prioridad.slice(1);

        // 2. Lógica de Tiempo Restante (Solo si está activo)
        let timeRemainingHTML = '';
        if (pendiente.estado === 'activo') {
            const { texto, excedido } = DatesUtils.calcularTiempoRestante(pendiente);
            const colorClass = excedido ? 'negative' : '';
            timeRemainingHTML = `
                <div class="card-row mt-2">
                    <span class="card-label">Tiempo Restante:</span>
                    <span class="time-remaining ${colorClass}">${texto}</span>
                </div>
            `;
        }

        // 3. Formateo de fechas
        const fechaCreacion = FormatUtils.formatDate(pendiente.fechaCreacion);
        const fechaActivacion = pendiente.fechaActivacion 
            ? FormatUtils.formatDateTime(pendiente.fechaActivacion) 
            : '-';

        // 4. Construcción del HTML interno
        card.innerHTML = `
            <div class="card-header-custom">
                <h3 class="card-title" title="${pendiente.titulo}">${pendiente.titulo}</h3>
                <span class="badge ${priorityClass}">${priorityLabel}</span>
            </div>
            
            <div class="card-body-custom">
                <div class="card-row">
                    <span class="card-label">Proyecto:</span>
                    <span>${pendiente.proyecto}</span>
                </div>
                
                <div class="card-row">
                    <span class="card-label">Estado:</span>
                    <span class="text-capitalize">${pendiente.estado}</span>
                </div>

                <div class="card-row">
                    <span class="card-label">Creado:</span>
                    <span>${fechaCreacion}</span>
                </div>

                <div class="card-row">
                    <span class="card-label">Activado:</span>
                    <span>${fechaActivacion}</span>
                </div>

                ${timeRemainingHTML}
            </div>

            <div class="card-footer-custom">
                <button class="btn btn-outline-primary btn-sm btn-ver-pendiente" data-id="${pendiente.id}">
                    Ver más
                </button>
            </div>
        `;

        return card;
    }
}