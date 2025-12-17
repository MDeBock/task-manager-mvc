import { PendientesDomain } from '../../domain/pendientes.domain.js';

export class CrearEditarModal {
    
    static modalInstance = null;
    static isEditMode = false;
    static currentId = null;
    static onSaveCallback = null;

    /**
     * Abre el modal para Crear (id=null) o Editar (id!=null)
     * @param {string|null} id - ID del pendiente a editar o null para crear
     * @param {Function} onSaveCallback - Función a ejecutar tras guardar exitosamente
     */
    static abrir(id, onSaveCallback) {
        this.currentId = id;
        this.isEditMode = !!id;
        this.onSaveCallback = onSaveCallback;

        // 1. Inyectar HTML
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = this._getHtmlStructure();

        // 2. Configurar UI según modo
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.textContent = this.isEditMode ? 'Editar Pendiente' : 'Crear Pendiente';

        // 3. Precargar datos si es edición
        if (this.isEditMode) {
            const pendiente = PendientesDomain.obtenerPorId(id);
            if (pendiente) {
                this._llenarFormulario(pendiente);
            }
        }

        // 4. Inicializar y mostrar
        const modalEl = document.getElementById('modalCrearEditar');
        this.modalInstance = new window.bootstrap.Modal(modalEl);
        
        // Evento cleanup
        modalEl.addEventListener('hidden.bs.modal', () => {
            modalContainer.innerHTML = '';
        });

        // Evento Guardar
        document.getElementById('formPendiente').addEventListener('submit', (e) => {
            e.preventDefault();
            this._guardar();
        });

        this.modalInstance.show();
    }

    static _getHtmlStructure() {
        return `
            <div class="modal fade" id="modalCrearEditar" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalTitle">Nuevo Pendiente</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formPendiente">
                                <div class="mb-3">
                                    <label for="inputTitulo" class="form-label">Título *</label>
                                    <input type="text" class="form-control" id="inputTitulo" required>
                                </div>
                                <div class="mb-3">
                                    <label for="inputProyecto" class="form-label">Proyecto *</label>
                                    <input type="text" class="form-control" id="inputProyecto" required>
                                </div>
                                <div class="mb-3">
                                    <label for="inputPrioridad" class="form-label">Prioridad *</label>
                                    <select class="form-select" id="inputPrioridad" required>
                                        <option value="alta">Alta</option>
                                        <option value="media">Media</option>
                                        <option value="baja">Baja</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="inputPlazo" class="form-label">Plazo (Horas) *</label>
                                    <input type="number" class="form-control" id="inputPlazo" min="1" step="1" required>
                                    <div class="form-text">Número entero mayor a 0.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="inputDetalle" class="form-label">Detalle *</label>
                                    <textarea class="form-control" id="inputDetalle" rows="3" required></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" form="formPendiente" class="btn btn-primary">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    static _llenarFormulario(p) {
        document.getElementById('inputTitulo').value = p.titulo;
        document.getElementById('inputProyecto').value = p.proyecto;
        document.getElementById('inputPrioridad').value = p.prioridad;
        document.getElementById('inputPlazo').value = p.plazoHoras;
        document.getElementById('inputDetalle').value = p.detalle;
    }

    static _guardar() {
        // Obtener valores
        const data = {
            titulo: document.getElementById('inputTitulo').value.trim(),
            proyecto: document.getElementById('inputProyecto').value.trim(),
            prioridad: document.getElementById('inputPrioridad').value,
            plazoHoras: parseInt(document.getElementById('inputPlazo').value),
            detalle: document.getElementById('inputDetalle').value.trim()
        };

        // Validaciones extra (aunque HTML5 valida required)
        if (isNaN(data.plazoHoras) || data.plazoHoras <= 0) {
            alert("El plazo debe ser un número entero mayor a 0.");
            return;
        }

        try {
            if (this.isEditMode) {
                PendientesDomain.editar(this.currentId, data);
            } else {
                PendientesDomain.crear(data);
            }

            // Éxito
            this.modalInstance.hide();
            if (this.onSaveCallback) this.onSaveCallback();

        } catch (error) {
            alert("Error al guardar: " + error.message);
        }
    }
}