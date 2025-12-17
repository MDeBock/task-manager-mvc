import { PendientesDomain } from '../../domain/pendientes.domain.js';

export class ComentarioModal {
    
    static modalInstance = null;
    static currentId = null;
    static onSavedCallback = null;

    /**
     * Abre un modal dedicado para ingresar comentarios extensos
     * @param {string} id - ID del pendiente
     * @param {Function} onSavedCallback - Se ejecuta al guardar para refrescar la UI
     */
    static abrir(id, onSavedCallback) {
        this.currentId = id;
        this.onSavedCallback = onSavedCallback;

        // Inyectar HTML temporal para este modal
        const modalContainer = document.createElement('div');
        modalContainer.id = 'temp-comment-modal-wrapper';
        modalContainer.innerHTML = this._getHtml();
        document.body.appendChild(modalContainer);

        const modalEl = document.getElementById('modalComentario');
        this.modalInstance = new window.bootstrap.Modal(modalEl);

        // Evento al cerrar para limpiar el DOM
        modalEl.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalContainer);
            this.modalInstance = null;
        });

        // Evento Guardar
        document.getElementById('btnGuardarComentario').onclick = () => this._guardar();

        this.modalInstance.show();
    }

    static _getHtml() {
        return `
            <div class="modal fade" id="modalComentario" tabindex="-1" style="z-index: 1060;">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Agregar Comentario</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="txtComentarioExtenso" class="form-label">Escriba su comentario:</label>
                                <textarea class="form-control" id="txtComentarioExtenso" rows="5" placeholder="Ingrese detalles aquí..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btnGuardarComentario">Guardar Comentario</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    static _guardar() {
        const texto = document.getElementById('txtComentarioExtenso').value.trim();
        if (!texto) {
            alert("El comentario no puede estar vacío.");
            return;
        }

        try {
            PendientesDomain.agregarComentario(this.currentId, texto);
            this.modalInstance.hide();
            if (this.onSavedCallback) this.onSavedCallback();
        } catch (error) {
            alert(error.message);
        }
    }
}