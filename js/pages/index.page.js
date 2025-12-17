import { PendientesDomain } from '../domain/pendientes.domain.js';
import { ExportService } from '../services/export.service.js';
import { ImportService } from '../services/import.service.js';
import { PendienteCard } from '../components/cards/pendienteCard.js';
import { VerModal } from '../components/modales/verModal.js';

// Estado local de la página
let refreshInterval;

export function initDashboard() {
    console.log('Iniciando Dashboard...');
    
    // 1. Renderizado inicial
    renderActivos();
    initFiltros();
    renderPendientes();

    // 2. Event Listeners del Dashboard
    setupFilterEvents();
    setupHeaderEvents();

    // 3. Intervalo de actualización de tiempos (cada 15 min)
    startTimer();
}

/* --- SECCIÓN 1: PENDIENTES ACTIVOS --- */
function renderActivos() {
    const container = document.getElementById('container-activos');
    const msgEmpty = document.getElementById('msg-no-activos');
    const activos = PendientesDomain.obtenerActivos();

    container.innerHTML = '';

    if (activos.length === 0) {
        msgEmpty.classList.remove('d-none');
    } else {
        msgEmpty.classList.add('d-none');
        activos.forEach(pendiente => {
            const cardHTML = PendienteCard.render(pendiente);
            container.appendChild(cardHTML);
        });
    }
}

/* --- SECCIÓN 2: PENDIENTES (Con Filtros) --- */
function initFiltros() {
    // Llenar select de proyectos dinámicamente
    const selectProyecto = document.getElementById('filterProyecto');
    const proyectos = PendientesDomain.obtenerProyectosDisponibles(); // Solo de pendientes
    
    // Mantener la opción por defecto
    selectProyecto.innerHTML = '<option value="">Todos los proyectos</option>';
    
    proyectos.forEach(proy => {
        const option = document.createElement('option');
        option.value = proy;
        option.textContent = proy;
        selectProyecto.appendChild(option);
    });
}

function renderPendientes() {
    const container = document.getElementById('container-pendientes');
    const msgEmpty = document.getElementById('msg-no-pendientes');

    // Obtener valores de filtros
    const proyecto = document.getElementById('filterProyecto').value;
    const prioridad = document.getElementById('filterPrioridad').value;
    const orden = document.getElementById('sortOrder').value;

    // Obtener datos filtrados desde el dominio
    const pendientes = PendientesDomain.obtenerPendientesFiltrados({
        proyecto,
        prioridad,
        orden
    });

    container.innerHTML = '';

    if (pendientes.length === 0) {
        msgEmpty.classList.remove('d-none');
    } else {
        msgEmpty.classList.add('d-none');
        pendientes.forEach(pendiente => {
            const cardHTML = PendienteCard.render(pendiente);
            container.appendChild(cardHTML);
        });
    }
}

/* --- EVENTOS --- */
function setupFilterEvents() {
    ['filterProyecto', 'filterPrioridad', 'sortOrder'].forEach(id => {
        document.getElementById(id).addEventListener('change', renderPendientes);
    });

    document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
        document.getElementById('filterProyecto').value = "";
        document.getElementById('filterPrioridad').value = "";
        document.getElementById('sortOrder').value = "fecha_asc";
        renderPendientes();
    });
}

function setupHeaderEvents() {
    // Botones del Header (Importar/Exportar)
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
            if (success) {
                // Recargar todo si hubo importación exitosa
                renderActivos();
                initFiltros();
                renderPendientes();
            }
            fileInput.value = ''; // Limpiar input
        }
    });
    
    // Delegación de eventos para el botón "Ver más" de las tarjetas
    // (Ya que las tarjetas se crean dinámicamente)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-ver-pendiente')) {
            const id = e.target.closest('.btn-ver-pendiente').dataset.id;
            VerModal.abrir(id, () => {
                // Callback al cerrar el modal (actualizar UI)
                renderActivos();
                initFiltros(); // Por si cambiaron proyectos
                renderPendientes();
            });
        }
    });
}

/* --- TIMERS --- */
function startTimer() {
    // Actualizar cada 15 minutos (900000 ms)
    refreshInterval = setInterval(() => {
        renderActivos(); // Solo activos tienen tiempo restante crítico
    }, 900000);
}