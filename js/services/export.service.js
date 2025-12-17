import { PendientesDomain } from '../domain/pendientes.domain.js';
import { FormatUtils } from '../utils/format.js';
import { DatesUtils } from '../utils/dates.js';

export class ExportService {

    static exportarCSV() {
        const datos = this._prepararDatos();
        if (datos.length === 0) {
            alert("No hay pendientes para exportar (solo se exportan Activos y Pendientes).");
            return;
        }

        const csvContent = this._generarContenidoCSV(datos);
        const filename = this._generarNombreArchivo('csv');
        this._descargarArchivo(csvContent, filename, 'text/csv;charset=utf-8;');
    }

    static exportarExcel() {
        const datos = this._prepararDatos();
        if (datos.length === 0) {
            alert("No hay pendientes para exportar.");
            return;
        }

        // Generamos un falso Excel usando HTML Table (compatible con .xls antiguo)
        const xlsContent = this._generarContenidoXLS(datos);
        const filename = this._generarNombreArchivo('xls');
        this._descargarArchivo(xlsContent, filename, 'application/vnd.ms-excel');
    }

    // --- HELPERS PRIVADOS ---

    static _prepararDatos() {
        const todos = PendientesDomain.obtenerTodos();
        // Solo exportar pendientes y activos (NO finalizados)
        const filtrados = todos.filter(p => p.estado !== 'finalizado');

        return filtrados.map(p => ({
            id: p.id,
            titulo: p.titulo,
            detalle: p.detalle, // Cuidado con saltos de línea en CSV
            proyecto: p.proyecto,
            prioridad: p.prioridad,
            plazoHoras: p.plazoHoras,
            estado: p.estado,
            // Fechas en formato AAAA/MM/DD para exportación
            fechaCreacion: p.fechaCreacion, 
            fechaActivacion: p.fechaActivacion || '',
            fechaFinalizacion: p.fechaFinalizacion || '',
            // Comentarios como JSON stringificado
            comentarios: JSON.stringify(p.comentarios).replace(/"/g, '""') // Escapar comillas dobles para CSV
        }));
    }

    static _generarNombreArchivo(ext) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return `pendientes_${dd}-${mm}-${yyyy}.${ext}`;
    }

    static _generarContenidoCSV(datos) {
        // Encabezados
        const headers = ['id', 'titulo', 'detalle', 'proyecto', 'prioridad', 'plazoHoras', 'estado', 'fechaCreacion', 'fechaActivacion', 'fechaFinalizacion', 'comentarios'];
        
        const rows = datos.map(row => {
            return headers.map(fieldName => {
                let data = row[fieldName] || '';
                // Limpiar saltos de línea en detalle para no romper el CSV
                if (typeof data === 'string') {
                    data = data.replace(/(\r\n|\n|\r)/gm, " ");
                }
                return `"${data}"`; // Envolver siempre en comillas
            }).join(',');
        });

        // Unir header y filas con salto de línea
        return [headers.join(','), ...rows].join('\n');
    }

    static _generarContenidoXLS(datos) {
        // Template XML básico para Excel
        let tabla = '<table><thead><tr>';
        
        // Headers
        const headers = ['ID', 'Título', 'Detalle', 'Proyecto', 'Prioridad', 'Plazo (h)', 'Estado', 'Fecha Creación', 'Fecha Activación', 'Comentarios'];
        headers.forEach(h => tabla += `<th>${h}</th>`);
        tabla += '</tr></thead><tbody>';

        // Body
        datos.forEach(p => {
            tabla += '<tr>';
            tabla += `<td>${p.id}</td>`;
            tabla += `<td>${p.titulo}</td>`;
            tabla += `<td>${p.detalle}</td>`;
            tabla += `<td>${p.proyecto}</td>`;
            tabla += `<td>${p.prioridad}</td>`;
            tabla += `<td>${p.plazoHoras}</td>`;
            tabla += `<td>${p.estado}</td>`;
            tabla += `<td>${p.fechaCreacion}</td>`;
            tabla += `<td>${p.fechaActivacion}</td>`;
            tabla += `<td>${p.comentarios}</td>`;
            tabla += '</tr>';
        });

        tabla += '</tbody></table>';
        
        // Agregar BOM y metadatos XML para asegurar codificación UTF-8 en Excel
        return `\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body>${tabla}</body></html>`;
    }

    static _descargarArchivo(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}