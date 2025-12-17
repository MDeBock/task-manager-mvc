import { StorageService } from '../services/storage.service.js';
import { DatesUtils } from '../utils/dates.js';

export class PendientesDomain {

    // --- LECTURA ---

    static obtenerTodos() {
        return StorageService.getPendientes();
    }

    static obtenerPorId(id) {
        const pendientes = this.obtenerTodos();
        return pendientes.find(p => p.id === id);
    }

    static obtenerActivos() {
        return this.obtenerTodos().filter(p => p.estado === 'activo');
    }

    static obtenerProyectosDisponibles() {
        const pendientes = this.obtenerTodos().filter(p => p.estado === 'pendiente');
        const proyectos = [...new Set(pendientes.map(p => p.proyecto))];
        return proyectos.sort();
    }

    static obtenerPendientesFiltrados({ proyecto, prioridad, orden }) {
        let lista = this.obtenerTodos().filter(p => p.estado === 'pendiente');

        if (proyecto && proyecto !== "") {
            lista = lista.filter(p => p.proyecto === proyecto);
        }
        if (prioridad && prioridad !== "") {
            lista = lista.filter(p => p.prioridad === prioridad);
        }

        lista.sort((a, b) => {
            if (orden === 'prioridad_desc') {
                const pesos = { 'alta': 3, 'media': 2, 'baja': 1 };
                return pesos[b.prioridad] - pesos[a.prioridad];
            } else {
                return a.fechaCreacion.localeCompare(b.fechaCreacion);
            }
        });

        return lista;
    }

    // --- ESCRITURA (CRUD) ---

    static crear(data) {
        const nuevoPendiente = {
            id: crypto.randomUUID(),
            titulo: data.titulo,
            detalle: data.detalle,
            proyecto: data.proyecto,
            prioridad: data.prioridad,
            plazoHoras: Number(data.plazoHoras),
            estado: 'pendiente',
            fechaCreacion: DatesUtils.getTodayDateString(),
            fechaActivacion: null,
            fechaFinalizacion: null,
            tiempoRealHoras: null, // NUEVO CAMPO
            comentarios: []
        };

        const pendientes = this.obtenerTodos();
        pendientes.push(nuevoPendiente);
        StorageService.savePendientes(pendientes);
        
        return nuevoPendiente;
    }

    static editar(id, data) {
        const pendientes = this.obtenerTodos();
        const index = pendientes.findIndex(p => p.id === id);
        
        if (index === -1) throw new Error("Pendiente no encontrado");
        
        pendientes[index] = {
            ...pendientes[index],
            titulo: data.titulo,
            detalle: data.detalle,
            proyecto: data.proyecto,
            prioridad: data.prioridad,
            plazoHoras: Number(data.plazoHoras),
            fechaCreacion: DatesUtils.getTodayDateString() 
        };

        StorageService.savePendientes(pendientes);
    }

    static eliminar(id) {
        let pendientes = this.obtenerTodos();
        const initialLength = pendientes.length;
        
        pendientes = pendientes.filter(p => p.id !== id);
        
        if (pendientes.length === initialLength) throw new Error("No se pudo eliminar: ID no encontrado");
        
        StorageService.savePendientes(pendientes);
    }

    // --- CAMBIOS DE ESTADO ---

    static activar(id) {
        const pendientes = this.obtenerTodos();
        const pendiente = pendientes.find(p => p.id === id);
        
        if (!pendiente) throw new Error("Pendiente no encontrado");
        if (pendiente.estado !== 'pendiente') throw new Error("Solo se pueden activar pendientes en estado 'pendiente'");

        pendiente.estado = 'activo';
        pendiente.fechaActivacion = DatesUtils.getNowDateTimeString();

        StorageService.savePendientes(pendientes);
    }

    static finalizar(id, comentarioObligatorio) {
        const pendientes = this.obtenerTodos();
        const pendiente = pendientes.find(p => p.id === id);

        if (!pendiente) throw new Error("Pendiente no encontrado");
        if (pendiente.estado !== 'activo') throw new Error("Solo se pueden finalizar pendientes 'activos'");

        const fechaFinal = DatesUtils.getNowDateTimeString();
        
        // CÁLCULO DE TIEMPO TRANSCURRIDO (NUEVO REQUERIMIENTO)
        let tiempoReal = 0;
        if (pendiente.fechaActivacion) {
            // Convertir formato "AAAA/MM/DD HH:MM" a objeto Date compatible
            const startStr = pendiente.fechaActivacion.replace(/\//g, '-').replace(' ', 'T');
            const endStr = fechaFinal.replace(/\//g, '-').replace(' ', 'T');
            
            const startDate = new Date(startStr);
            const endDate = new Date(endStr);
            
            // Diferencia en milisegundos a horas (con decimales)
            const diffMs = endDate - startDate;
            tiempoReal = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)); // ej: 2.5 horas
        }

        pendiente.estado = 'finalizado';
        pendiente.fechaFinalizacion = fechaFinal;
        pendiente.tiempoRealHoras = tiempoReal; // Guardamos el dato calculado
        
        pendiente.comentarios.push({
            fecha: fechaFinal,
            comentario: comentarioObligatorio
        });

        StorageService.savePendientes(pendientes);
    }

    static agregarComentario(id, texto) {
        const pendientes = this.obtenerTodos();
        const pendiente = pendientes.find(p => p.id === id);

        if (!pendiente) throw new Error("Pendiente no encontrado");

        pendiente.comentarios.push({
            fecha: DatesUtils.getNowDateTimeString(),
            comentario: texto
        });

        StorageService.savePendientes(pendientes);
    }
}