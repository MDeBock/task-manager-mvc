import { initDashboard } from './pages/index.page.js';
import { initPendientes } from './pages/pendientes.page.js';

document.addEventListener('DOMContentLoaded', () => {
    // Verificación robusta: detectamos la página por elementos únicos en el DOM
    // en lugar de depender del nombre del archivo en la URL.
    
    const tablaPendientes = document.getElementById('tablaPendientes');
    
    if (tablaPendientes) {
        // Si existe la tabla, estamos en la página de pendientes
        initPendientes();
    } else {
        // Si no, asumimos que es el dashboard
        initDashboard();
    }
});