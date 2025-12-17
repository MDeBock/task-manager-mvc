import { PendientesDomain } from '../../domain/pendientes.domain.js';
import { FormatUtils } from '../../utils/format.js';
import { DatesUtils } from '../../utils/dates.js';
import { CrearEditarModal } from './crearEditarModal.js';
import { ComentarioModal } from './comentarioModal.js'; // Importamos el nuevo modal

export class VerModal {
    
    static modalInstance = null;
    static currentPendienteId = null;
    static onCloseCallback = null;

    static abrir(id, onCloseCallback) {
        this.currentPendienteId = id;
        this.onCloseCallback = onCloseCallback;
        
        const pendiente = PendientesDomain.obtenerPorId(id);
        if (!pendiente) return;

        // 1. Inyectar HTML del Modal
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = this._getHtmlStructure();

        // 2. Llenar datos
        this._renderDatos(pendiente);
        this._renderComentarios(pendiente);
        this._renderBotones(pendiente);

        // 3. Inicializar Modal
        const modalEl = document.getElementById('modalVerPendiente');
        this.modalInstance = new window.bootstrap.Modal(modalEl);
        
        modalEl.addEventListener('hidden.bs.modal', () => {
            if (this.onCloseCallback) this.onCloseCallback();
            modalContainer.innerHTML = '';
        });

        this.modalInstance.show();
    }

    static _getHtmlStructure() {
        return `
            <div class="modal fade" id="modalVerPendiente" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detalle del Pendiente</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="modal-info-grid" id="infoGrid"></div>
                            
                            <div class="full-width-section mt-3">
                                <span class="info-label">Detalle</span>
                                <div class="p-2 bg-light border rounded" id="infoDetalle"></div>
                            </div>

                            <div class="full-width-section mt-3">
                                <h6 class="mb-2">Comentarios</h6>
                                <div class="comments-container" id="listaComentarios"></div>
                            </div>
                        </div>
                        <div class="modal-footer justify-content-between" id="modalFooter"></div>
                    </div>
                </div>
            </div>`;
    }

    static _renderDatos(p) {
        const grid = document.getElementById('infoGrid');
        
        // --- LÓGICA TIEMPO RESTANTE (Activo) ---
        let tiempoHtml = '';
        if (p.estado === 'activo') {
            const { texto, excedido } = DatesUtils.calcularTiempoRestante(p);
            const colorStyle = excedido ? 'color: var(--bs-danger);' : 'color: var(--bs-primary);';
            tiempoHtml = `<div>
                            <span class="info-label">Tiempo Restante</span>
                            <span class="info-value" style="${colorStyle} font-weight:bold;">${texto}</span>
                          </div>`;
        }

        // --- LÓGICA TIEMPO FINAL (Finalizado - Nuevo Requerimiento) ---
        let tiempoFinalHtml = '';
        if (p.estado === 'finalizado' && p.tiempoRealHoras !== undefined) {
            const plazo = p.plazoHoras;
            const real = p.tiempoRealHoras;
            // Azul si cumplió (<= plazo), Rojo si se excedió (> plazo)
            const colorClass = real <= plazo ? 'text-primary' : 'text-danger';
            
            tiempoFinalHtml = `<div>
                                <span class="info-label">Tiempo Real Ejecución</span>
                                <span class="info-value fw-bold ${colorClass}">
                                    ${real} horas ${real > plazo ? '(Excedido)' : '(A tiempo)'}
                                </span>
                               </div>`;
        }

        // Inyectar datos cortos en el Grid
        grid.innerHTML = `
            <div>
                <span class="info-label">Título</span>
                <span class="info-value">${p.titulo}</span>
            </div>
            <div>
                <span class="info-label">Proyecto</span>
                <span class="info-value">${p.proyecto}</span>
            </div>
            <div>
                <span class="info-label">Prioridad</span>
                <span class="badge badge-priority-${p.prioridad}">${p.prioridad.toUpperCase()}</span>
            </div>
            <div>
                <span class="info-label">Estado</span>
                <span class="text-capitalize info-value fw-bold">${p.estado}</span>
            </div>
            <div>
                <span class="info-label">Fecha Creación</span>
                <span class="info-value">${FormatUtils.formatDate(p.fechaCreacion)}</span>
            </div>
            <div>
                <span class="info-label">Plazo Estimado</span>
                <span class="info-value">${p.plazoHoras} horas</span>
            </div>
            <div>
                <span class="info-label">Fecha Activación</span>
                <span class="info-value">${p.fechaActivacion ? FormatUtils.formatDateTime(p.fechaActivacion) : '-'}</span>
            </div>
            <div>
                <span class="info-label">Fecha Finalización</span>
                <span class="info-value">${p.fechaFinalizacion ? FormatUtils.formatDateTime(p.fechaFinalizacion) : '-'}</span>
            </div>
            ${tiempoHtml}
            ${tiempoFinalHtml}
        `;

        // Detalle fuera del grid
        document.getElementById('infoDetalle').textContent = p.detalle;
    }

    static _renderComentarios(p) {
        const container = document.getElementById('listaComentarios');
        if (!p.comentarios || p.comentarios.length === 0) {
            container.innerHTML = '<p class="text-muted fst-italic small">Sin comentarios.</p>';
            return;
        }
        const comentariosSorted = [...p.comentarios].reverse();
        container.innerHTML = comentariosSorted.map(c => `
            <div class="comment-item">
                <span class="comment-date">${c.fecha}</span>
                <div class="comment-text">${c.comentario}</div>
            </div>
        `).join('');
    }

    static _renderBotones(p) {
        const footer = document.getElementById('modalFooter');
        let htmlLeft = '';
        let htmlRight = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>';

        if (p.estado === 'pendiente') {
            htmlLeft = `
                <button class="btn btn-outline-danger" id="btnEliminar"><i class="bi bi-trash"></i></button>
                <button class="btn btn-outline-primary" id="btnEditar"><i class="bi bi-pencil"></i> Editar</button>
            `;
            htmlRight = `
                <button class="btn btn-info text-white" id="btnAddComentario"><i class="bi bi-chat-left-text"></i> Comentar</button>
                <button class="btn btn-success" id="btnActivar"><i class="bi bi-play-fill"></i> Activar</button>
            `;
        } else if (p.estado === 'activo') {
            htmlLeft = ``;
            htmlRight = `
                <button class="btn btn-info text-white" id="btnAddComentario"><i class="bi bi-chat-left-text"></i> Comentar</button>
                <button class="btn btn-info" id="btnFinalizar" style="background-color: #0dcaf0; color:white;">
                    <i class="bi bi-check-lg"></i> Finalizar
                </button>
            `;
        }
        
        footer.innerHTML = `<div class="d-flex gap-2">${htmlLeft}</div><div class="d-flex gap-2">${htmlRight}</div>`;
        this._setupEvents(p);
    }

    static _setupEvents(p) {
        const btnActivar = document.getElementById('btnActivar');
        const btnEliminar = document.getElementById('btnEliminar');
        const btnEditar = document.getElementById('btnEditar');
        const btnAddComentario = document.getElementById('btnAddComentario');
        const btnFinalizar = document.getElementById('btnFinalizar');

        if (btnActivar) btnActivar.onclick = () => this._accionActivar(p.id);
        if (btnEliminar) btnEliminar.onclick = () => this._accionEliminar(p.id);
        if (btnEditar) btnEditar.onclick = () => this._accionEditar(p.id);
        
        // USAR NUEVO MODAL DE COMENTARIO
        if (btnAddComentario) btnAddComentario.onclick = () => {
            // No cerramos el modal actual, abrimos el de comentario encima
            ComentarioModal.abrir(p.id, () => {
                // Al guardar, refrescamos los datos de ESTE modal sin cerrarlo
                const actualizado = PendientesDomain.obtenerPorId(p.id);
                this._renderComentarios(actualizado);
            });
        };
        
        if (btnFinalizar) btnFinalizar.onclick = () => this._accionFinalizar(p.id);
    }

    /* --- ACCIONES --- */
    static _accionActivar(id) {
        PendientesDomain.activar(id);
        this.modalInstance.hide();
    }
    static _accionEliminar(id) {
        if (confirm('¿Eliminar pendiente?')) {
            PendientesDomain.eliminar(id);
            this.modalInstance.hide();
        }
    }
    static _accionEditar(id) {
        this.modalInstance.hide();
        setTimeout(() => CrearEditarModal.abrir(id, this.onCloseCallback), 300);
    }
    static _accionFinalizar(id) {
        // También usamos el ComentarioModal para el comentario obligatorio de finalización?
        // El requerimiento dice "pedir comentario obligatorio". 
        // Podemos usar el prompt o reutilizar el ComentarioModal con una lógica diferente,
        // pero para no complicar, usaremos un prompt mejorado o el modal nuevo.
        // Por simplicidad y consistencia con el requerimiento 1, usemos prompt simple aquí
        // O mejor: usar un prompt estándar ya que es una acción de "cierre".
        
        const comentario = prompt("Comentario obligatorio para finalizar:");
        if (comentario === null) return;
        if (comentario.trim() === "") {
            alert("El comentario es obligatorio.");
            return;
        }
        PendientesDomain.finalizar(id, comentario);
        this.modalInstance.hide();
    }
}