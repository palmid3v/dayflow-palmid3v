# 🌊 𝐃𝐚𝐲𝐅𝐥𝐨𝐰 — Productividad personal

> **PALMI-D3V** · Aplicación central de productividad personal.

## 🎯 Producto
DayFlow reúne tareas, horarios recurrentes, planificación diaria, calendario, recordatorios, revisión y memoria en una sola experiencia. Today es una vista general de solo lectura; cada dominio conserva su módulo propietario para evitar duplicaciones.

## ✨ Capacidades y base técnica
- Vista diaria, ejecución de bloques y gestión de tareas.
- Horarios recurrentes, detección de solapamientos y exportación/importación ICS.
- Recordatorios, revisión diaria, dashboard y memoria personal.
- Firebase Authentication y datos aislados por UID.
- Interfaz responsive y PWA.
- Administración de acceso y políticas por función.
- **Stack declarado:** React 19, Vite 7, Firebase Authentication, Cloud Firestore, PWA y Playwright. Los rangos/versiones instalados se verifican en `app/package.json`.

## 🔎 Quality checkpoint — 2026-11-12

See [QUALITY-CHECKPOINT-2026-11-12.md](QUALITY-CHECKPOINT-2026-11-12.md) for the latest CI evidence, changes under review and release gates. CI status is not represented as green until the corresponding GitHub Actions run completes successfully.

## 📊 Estado del proyecto
**Avance por fases del roadmap principal: 50% (1 de 2 fases de producto documentadas).**
- **Fase 1 — Cierre To-Do + Timetable: CERRADA por aceptación del usuario.**
- **Fase 2 — Cupboard como inventario central: pertenece a Cupboard; integración de alertas/eventos con DayFlow sigue siendo evolución del ecosistema.**
- La cifra mide fases de producto, no porcentaje de código ni release de producción.

**Validación histórica documentada (checkpoint 2026-10-19):** Node 33/33; Firestore Rules 6/6 en emulador; ESLint, build y generación PWA aprobados; `npm audit` informó 0 vulnerabilidades. No es una ejecución nueva ni prueba de producción.

## 🧭 Evolución de producto
1. Consolidación de To-Do y Timetable dentro de DayFlow — aceptada.
2. Mantener DayFlow como propietario de tiempo, planificación, recordatorios y calendario.
3. Consumir eventos/alertas relevantes de otras aplicaciones mediante contratos explícitos, sin duplicar inventario ni pedidos.
4. Mantener fuentes heredadas disponibles hasta reconciliar datos, permisos, funciones, dominios, historial, backup y rollback.

## 🔒 Seguridad y límite de release
- Firebase Auth y Firestore son la identidad y fuente cloud de verdad; datos bajo `users/{uid}`.
- LocalStorage es caché/recuperación, no fuente canónica.
- Presupuesto objetivo: **$0 de gasto obligatorio**.
- No depender de Cloud Functions programadas ni servicios de correo pagados bajo ese límite sin aprobación.
- Migraciones y despliegues de Rules requieren backup, pruebas de emulador, aceptación y rollback.
- No retirar To-Do/Timetable heredados antes de reconciliar datos y controles.
- No se declara producción validada por resultados locales.

## 🧪 Desarrollo local
Desde la raíz del repositorio:

```powershell
npm --prefix app install
npm --prefix app run dev
npm --prefix app run lint
npm --prefix app run build
npm --prefix app test
npm --prefix app run test:rules
```

Validación documentada de Rules utiliza Firestore Emulator. Revisar scripts vigentes en `app/package.json` antes de ejecutar.

## 📚 Documentación clave
- `CONTEXT.md` — arquitectura, límites y continuidad.
- `app/docs/ROADMAP.md` — fases y prioridades.
- `app/docs/QA_MATRIX.md` — baseline y validaciones pendientes.
- `app/docs/audits/UNIFICATION-AUDIT-2026-10.md` — auditoría de unificación.
- `app/docs/INTEGRATION_CONTRACT.md` — contrato de integración.
- [PALMI-D3V ecosystem handoff](https://github.com/palmid3v/PALMI-D3V-Connected-Workspace/blob/main/AI-HANDOFF-2026-11-01.md).

## 🤝 Identidad
**DayFlow · PALMI-D3V** — *Build · Create · Improve · Validate.*

DayFlow es propietario de productividad y tiempo. No es propietario del inventario de Cupboard, los pedidos de Sandwichies ni los registros financieros privados de Financial-D3v.
