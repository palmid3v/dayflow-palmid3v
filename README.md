# DayFlow

**DayFlow** es una aplicación de productividad personal que organiza tareas, horarios recurrentes, planificación diaria, calendario, recordatorios y revisión personal en un único espacio.

Su objetivo es ayudar a convertir compromisos y prioridades en un plan diario ejecutable, manteniendo una experiencia responsive y utilizable como PWA.

## Producto

- **Today:** vista diaria para consultar el plan, organizar bloques y registrar su ejecución.
- **Tasks:** creación, edición, priorización, clasificación, seguimiento y finalización de tareas.
- **Schedule:** plantillas de horarios recurrentes, detección de solapamientos y exportación de horarios.
- **Calendar:** visualización de eventos e importación de calendarios compatibles mediante archivos ICS.
- **Reminders:** recordatorios y notificaciones sujetos a los permisos y capacidades del navegador.
- **Daily Review y Memory:** revisión de resultados y registro de memoria personal.
- **Dashboard y administración:** resumen de actividad y gestión de accesos y capacidades.

Today coordina los módulos, pero no crea una segunda base de tareas ni sustituye la fuente canónica de horarios. Las tareas, plantillas, planes y registros conservan sus dominios dentro de DayFlow.

## Arquitectura y tecnologías

DayFlow utiliza **React 19**, **Vite 7**, Firebase Authentication y Cloud Firestore. La interfaz responsive se distribuye como Progressive Web App (PWA). Playwright y las herramientas de pruebas del repositorio cubren validaciones automatizadas y flujos de usuario.

Los datos personales se aíslan por UID autenticado y las reglas de Firestore aplican los permisos en el backend. LocalStorage se utiliza como caché o mecanismo de recuperación, no como fuente cloud canónica.

## Límites e integraciones

DayFlow es responsable de productividad, tiempo, calendario y recordatorios. No es propietario de inventario (Cupboard), pedidos o catálogo comercial (Sandwichies), ni de registros financieros privados (Financial-D3V).

Las integraciones con otras aplicaciones deben intercambiar eventos explícitos y mínimos. Una alerta de stock puede ayudar a planificar una tarea, pero no debe crear una copia del inventario. Los recordatorios del navegador dependen de permisos y capacidades de ejecución; no se presentan como un servicio garantizado de entrega en segundo plano.

La consolidación funcional de To-Do y Timetable está aceptada como hito de producto. La migración de datos de producción, retirada de fuentes heredadas y aprobación de release tienen controles independientes.

## Desarrollo

El código de aplicación se encuentra en `app/`. Desde la raíz se pueden utilizar los scripts npm con el prefijo `--prefix app`, según las definiciones vigentes en el repositorio. Las pruebas de Firestore Rules requieren Firebase Emulator; revisa los scripts antes de ejecutar validaciones.

## Documentación

- [Contexto y continuidad](CONTEXT.md)
- [Roadmap de producto](app/docs/ROADMAP.md)
- [Matriz de QA](app/docs/QA_MATRIX.md)
- [Contrato de dominio e integración](app/docs/INTEGRATION_CONTRACT.md)
- [Auditoría de unificación](app/docs/audits/UNIFICATION-AUDIT-2026-10.md)
- [Checkpoint de calidad](QUALITY-CHECKPOINT-2026-11-12.md)

## Repositorio y despliegue

- Repositorio: [palmid3v/dayflow-palmid3v](https://github.com/palmid3v/dayflow-palmid3v)
- Sitio web: [dayflowd3v.vercel.app](https://dayflowd3v.vercel.app)

La publicación del frontend no implica que las migraciones, pruebas autenticadas o procesos programados estén aprobados para producción.

---

**DayFlow · PALMI-D3V**  
*Build · Create · Improve · Validate.*
