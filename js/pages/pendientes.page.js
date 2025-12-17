import { PendientesDomain } from '../domain/pendientes.domain.js';
import { ExportService } from '../services/export.service.js';
import { ImportService } from '../services/import.service.js';
import { CrearEditarModal } from '../components/modales/crearEditarModal.js';
import { VerModal } from '../components/modales/verModal.js';
import { PendientesTable } from '../components/tablas/pendientesTable.js';

export function initPendientes() {
    console.log('Iniciando Gestión de Pendientes...');
    
    // 1. Renderizado inicial de la tabla
    renderTabla();

    // 2. Eventos Globales (Header y Botón Nuevo)
    setupEvents();
}

function renderTabla() {
    const todosLosPendientes = PendientesDomain.obtenerTodos();
    
    // Delegamos la construcción de la tabla al componente
    PendientesTable.render(todosLosPendientes, {
        onVer: (id) => VerModal.abrir(id, renderTabla),
        onEditar: (id) => CrearEditarModal.abrir(id, renderTabla),
        onEliminar: (id) => eliminarPendiente(id),
        onActivar: (id) => activarPendiente(id),
        onFinalizar: (id) => VerModal.abrir(id, renderTabla) // Reutilizamos el modal Ver para finalizar
    });
}

function setupEvents() {
    // Botón Nuevo Pendiente
    const btnNuevo = document.getElementById('btnNuevoPendiente');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', () => {
            CrearEditarModal.abrir(null, renderTabla); // null indica creación
        });
    }

    // Botones Header (Importar/Exportar)
    document.getElementById('btnExportCsv').addEventListener('click', () => {
        ExportService.exportarCSV();
    });

    document.getElementById('btnExportExcel').addEventListener('click', () => {
        ExportService.exportarExcel();
    });

    const btnImportar = document.getElementById('btnImportar');
    const fileInput = document.getElementById('fileImport');

    btnImportar.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            const success = await ImportService.importarArchivo(e.target.files[0]);
            if (success) renderTabla();
            fileInput.value = '';
        }
    });
}

/* --- LÓGICA DE ACCIONES DIRECTAS --- */

function eliminarPendiente(id) {
    if (confirm('¿Está seguro de eliminar este pendiente? Esta acción no se puede deshacer.')) {
        try {
            PendientesDomain.eliminar(id);
            renderTabla();
        } catch (error) {
            alert(error.message);
        }
    }
}

function activarPendiente(id) {
    try {
        PendientesDomain.activar(id);
        renderTabla();
    } catch (error) {
        alert(error.message);
    }
}