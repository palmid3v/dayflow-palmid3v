# 🌊 DayFlow — Productividad personal

> **by PALMI-D3V** · Producto digital en desarrollo continuo.

Aplicación central de productividad de PALMI-D3V, diseñada para reunir tareas, horarios recurrentes, planificación diaria, recordatorios, calendario, revisión y memoria en una experiencia única.

## ✨ Funcionalidades

- Vista diaria y ejecución de tareas
- Gestión de tareas
- Horarios y bloques recurrentes
- Importación/exportación de calendario
- Recordatorios y revisión diaria
- Dashboard y memoria personal
- Autenticación Firebase y datos por usuario
- Interfaz responsive y base PWA

## 🛠️ Tecnología

React · Vite · Firebase Authentication · Cloud Firestore · PWA

## 🚀 Ejecutar el proyecto

```bash
cd app
npm ci
npm run dev
```

Consulta los documentos del proyecto antes de configurar servicios, credenciales o despliegues. Los comandos pueden variar según el entorno y las dependencias instaladas.

## 🧭 Experiencia actual

La interfaz **Dark Premium** está aplicada a Today, Dashboard, Tasks, Schedule, Memory y Settings, con ajustes responsive y estados de interacción más claros. Today funciona como resumen de solo lectura; la creación y modificación se realizan en los módulos correspondientes. Recordatorios se administra desde su pestaña dedicada.

El diálogo de Settings se posiciona respecto al viewport y no depende de la posición de scroll de la página.

## 📍 Estado del proyecto

La capa visual y las pruebas locales de regresión fueron validadas manualmente por el mantenedor. La unificación **sigue en hardening**: faltan pruebas automatizadas de reglas de Firestore, evidencia autenticada de persistencia, reconciliación de datos reales, verificación de PWA/rollback y cierre de los flujos E2E de producción. No retirar los repositorios heredados ni declarar listo para producción hasta completar los gates documentados. Mantener el presupuesto operativo objetivo de $0.

## 📚 Documentación

`app/docs/ROADMAP.md`, `app/docs/audits/UNIFICATION-AUDIT-2026-10.md`, `app/docs/INTEGRATION_CONTRACT.md`, `CONTEXT.md`

La documentación técnica describe la arquitectura, las decisiones, las pruebas y el trabajo pendiente. Las funcionalidades futuras no se consideran implementadas hasta que exista evidencia en el código y validación correspondiente.

## 🤝 Créditos

Diseñado y desarrollado bajo la identidad **PALMI-D3V**.

---

*Build · Create · Improve · Validate*