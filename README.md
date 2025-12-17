# 📋 Gestión de Pendientes Web

Aplicación web **100% Frontend** para la gestión y seguimiento de tareas pendientes. Diseñada para funcionar directamente en el navegador sin necesidad de servidores, bases de datos externas ni procesos de compilación.

## 🚀 Características Principales

- **Gestión de Ciclo de Vida:** Flujo completo de tareas: *Pendiente* → *Activo* → *Finalizado*.
- **Sin Backend:** Persistencia de datos local utilizando **localStorage**.
- **Dashboard Interactivo:** Vista rápida de pendientes activos con cálculo de tiempo restante en tiempo real.
- **Listado Avanzado:** Tabla interactiva (DataTables) con búsqueda, filtros y ordenamiento.
- **Cálculo de Tiempos:**
  - Estimación de plazos.
  - **NUEVO:** Registro del tiempo real de ejecución al finalizar (comparativa vs. estimado).
- **Importación/Exportación:** Respaldo de datos en formatos CSV y Excel.
- **Diseño Responsive:** Adaptable a móviles y escritorio (Bootstrap 5).

---

## 🛠️ Tecnologías Utilizadas

- **Core:** HTML5, CSS3, JavaScript (ES6 Modules).
- **UI Framework:** [Bootstrap 5.3](https://getbootstrap.com/) (vía CDN).
- **Iconos:** [Bootstrap Icons](https://icons.getbootstrap.com/) (vía CDN).
- **Tablas:** [DataTables](https://datatables.net/) (con jQuery, vía CDN).
- **Persistencia:** Browser LocalStorage API.

---

## 📂 Estructura del Proyecto

La aplicación sigue una arquitectura modular similar a **MVC** (Modelo-Vista-Controlador) adaptada al frontend:

```text
/
├── index.html                  # Página principal (Dashboard)
├── pendientes.html             # Página de gestión (Tabla completa)
├── README.md                   # Documentación
├── css/
│   ├── main.css                # Variables y estilos globales
│   ├── layout.css              # Header y estructura
│   ├── cards.css               # Estilos de tarjetas del Dashboard
│   ├── modales.css             # Estilos de ventanas emergentes (Grids, Comentarios)
│   └── tablas.css              # Personalización de DataTables
└── js/
    ├── scripts.js              # Entry point (Router básico)
    ├── domain/
    │   └── pendientes.domain.js # Lógica de negocio y reglas de estado
    ├── services/
    │   ├── storage.service.js   # Capa de acceso a datos (LocalStorage)
    │   ├── export.service.js    # Generación de archivos CSV/XLS
    │   └── import.service.js    # Parsing y validación de archivos
    ├── components/             # UI Components (Renderizado dinámico)
    │   ├── cards/
    │   ├── modales/            # (Ver, Crear/Editar, Comentarios)
    │   └── tablas/
    ├── pages/                  # Controladores de página
    │   ├── index.page.js
    │   └── pendientes.page.js
    └── utils/                  # Helpers (Fechas, Formato, DOM)

    ⚙️ Instalación y Uso
Requisitos
Un navegador web moderno (Chrome, Firefox, Edge).

Conexión a internet (necesaria la primera vez para cargar las librerías CDN de Bootstrap y DataTables).

Ejecución
Descarga el código fuente.

Abre el archivo index.html directamente en tu navegador.

¡Listo! La aplicación ya está funcionando.

🧠 Lógica de Negocio y Estados
El sistema maneja 3 estados para cada tarea:

1. Estado: PENDIENTE (🟡)
Es el estado inicial al crear una tarea.

Acciones permitidas: Editar, Eliminar, Comentar, Activar.

Visualización: Aparece en la tabla principal (pendientes.html).

2. Estado: ACTIVO (🔵)
Indica que la tarea se está trabajando actualmente.

Se registra: Fecha y hora exacta de activación.

Acciones permitidas: Comentar, Finalizar.

Visualización:

Aparece destacado en el Dashboard (index.html).

Muestra un contador de tiempo restante basado en el plazo estimado.

Si el tiempo se agota, el contador se muestra en negativo y color rojo.

3. Estado: FINALIZADO (🟢)
Tarea concluida.

Se registra: Fecha y hora de finalización + Tiempo Real de Ejecución.

Acciones permitidas: Ver Detalle (Solo lectura).

Lógica de Tiempo Real:

Al finalizar, el sistema calcula automáticamente las horas transcurridas desde la activación.

Azul: Si el tiempo real fue menor o igual al plazo estimado.

Rojo: Si el tiempo real excedió el plazo estimado.

📤 Importar y Exportar
Exportar
CSV: Formato estándar separado por comas.

Excel: Formato compatible HTML/XML.

Nota: Solo se exportan los pendientes Activos y Pendientes. Los finalizados se consideran históricos (salvo configuración contraria en código).

Importar
Permite subir archivos generados previamente por la app.

Validación: El sistema verifica que el archivo tenga las columnas correctas.

Seguridad: Si el archivo está corrupto, la app muestra una alerta y no rompe la ejecución.

Los datos importados se agregan a los existentes (no sobrescriben).

📝 Notas para Desarrolladores
Persistencia
Los datos se guardan en la key pendientes del localStorage como un array de objetos JSON. Si necesitas limpiar la base de datos manualmente:

Abre la consola del navegador (F12).

Escribe: localStorage.removeItem('pendientes').

Recarga la página.

Personalización
Para cambiar los colores de prioridad, editar css/main.css.

Para ajustar el intervalo de actualización del Dashboard (default 15 min), editar js/pages/index.page.js.