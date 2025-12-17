export class PendientesTable {
    
    static dataTableInstance = null;

    /**
     * Renderiza (o actualiza) la tabla de pendientes utilizando DataTables
     * @param {Array} datos - Array de objetos pendiente
     * @param {Object} callbacks - Funciones para manejar acciones: { onVer, onEditar, onEliminar, onActivar, onFinalizar }
     */
    static render(datos, callbacks) {
        // Referencia a la tabla en el DOM
        const tableId = '#tablaPendientes';

        // Si ya existe una instancia, destruirla para reinicializar con nuevos datos
        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().destroy();
        }

        // Configuración de columnas
        this.dataTableInstance = $(tableId).DataTable({
            data: datos,
            responsive: true,
            language: {
                url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json"
            },
            order: [[0, 'asc']], // Ordenar por defecto por la primera columna (se ajustará abajo)
            columns: [
                { 
                    data: 'titulo',
                    title: 'Título' 
                },
                { 
                    data: 'proyecto',
                    title: 'Proyecto' 
                },
                { 
                    data: 'prioridad',
                    title: 'Prioridad',
                    render: function(data, type, row) {
                        if (type === 'display') {
                            // Renderizar badge según prioridad
                            return `<span class="badge badge-priority-${data}">${data.toUpperCase()}</span>`;
                        }
                        return data;
                    }
                },
                { 
                    data: 'plazoHoras',
                    title: 'Plazo (h)',
                    render: function(data) {
                        return data + ' h';
                    }
                },
                { 
                    data: 'estado',
                    title: 'Estado',
                    render: function(data) {
                        return `<span class="text-capitalize fw-bold">${data}</span>`;
                    }
                },
                {
                    data: null, // Columna de acciones (sin dato directo)
                    title: 'Acciones',
                    orderable: false,
                    className: 'text-end actions-column',
                    render: function(data, type, row) {
                        if (type !== 'display') return '';
                        
                        const id = row.id;
                        let botones = '';

                        // Botón Ver (Siempre visible)
                        botones += `
                            <button class="btn btn-sm btn-action btn-action-ver" data-id="${id}" title="Ver detalle">
                                <i class="bi bi-eye"></i>
                            </button>
                        `;

                        // Acciones según estado
                        if (row.estado === 'pendiente') {
                            botones += `
                                <button class="btn btn-sm btn-action btn-action-editar" data-id="${id}" title="Editar">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-action btn-action-activar" data-id="${id}" title="Activar">
                                    <i class="bi bi-play-fill"></i>
                                </button>
                                <button class="btn btn-sm btn-action btn-action-eliminar" data-id="${id}" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            `;
                        } else if (row.estado === 'activo') {
                            botones += `
                                <button class="btn btn-sm btn-action btn-action-finalizar" data-id="${id}" title="Finalizar">
                                    <i class="bi bi-check-lg"></i>
                                </button>
                            `;
                        }
                        // Estado 'finalizado' solo tiene botón Ver (ya agregado al inicio)

                        return botones;
                    }
                }
            ]
        });

        // Configurar Listeners de eventos (Delegación JQuery sobre el tbody)
        this._setupListeners(tableId, callbacks);
    }

    static _setupListeners(tableId, callbacks) {
        const tbody = $(tableId).find('tbody');

        // Limpiar eventos previos para evitar duplicados
        tbody.off('click');

        // Listener Ver
        tbody.on('click', '.btn-action-ver', function() {
            const id = $(this).data('id');
            if (callbacks.onVer) callbacks.onVer(id);
        });

        // Listener Editar
        tbody.on('click', '.btn-action-editar', function() {
            const id = $(this).data('id');
            if (callbacks.onEditar) callbacks.onEditar(id);
        });

        // Listener Eliminar
        tbody.on('click', '.btn-action-eliminar', function() {
            const id = $(this).data('id');
            if (callbacks.onEliminar) callbacks.onEliminar(id);
        });

        // Listener Activar
        tbody.on('click', '.btn-action-activar', function() {
            const id = $(this).data('id');
            if (callbacks.onActivar) callbacks.onActivar(id);
        });

        // Listener Finalizar
        tbody.on('click', '.btn-action-finalizar', function() {
            const id = $(this).data('id');
            if (callbacks.onFinalizar) callbacks.onFinalizar(id);
        });
    }
}