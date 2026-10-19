# 🌊 DayFlow — Productividad personal

> **by PALMI-D3V** · Aplicación central de productividad en construcción continua.

DayFlow reúne tareas, horarios recurrentes, planificación diaria, recordatorios, calendario, revisión y memoria en una sola experiencia.

## Funcionalidades actuales

- Vista diaria y ejecución de bloques.
- Gestión de tareas.
- Horarios recurrentes, detección de solapamientos y exportación ICS.
- Importación de calendario `.ics`.
- Recordatorios y revisión diaria.
- Dashboard y memoria personal.
- Autenticación Firebase y datos aislados por usuario.
- Interfaz responsive y base PWA.
- Administración de acceso y políticas por función.

Today es una vista general de solo lectura. Las modificaciones se hacen desde el módulo dueño de cada dominio, evitando superficies duplicadas.

## Tecnología

React 19 · Vite 7 · Firebase Authentication · Cloud Firestore · PWA · Playwright

## Ejecutar el proyecto

Desde la raíz del repositorio:

```powershell
npm --prefix app install
npm --prefix app run dev
```

## Validación local confirmada

En el checkpoint del 19 de octubre de 2026:

- Suite Node: **33/33 tests aprobados**, incluidos **6/6 tests de reglas de Firestore** en el emulador.
- ESLint: aprobado.
- Build de producción y generación del service worker PWA: aprobados.
- `npm audit`: **0 vulnerabilidades**.
- `@grpc/grpc-js`: `1.14.6` mediante npm override.
- Commit de seguridad `2877bff` publicado en `main`.

Los resultados automatizados locales no sustituyen la aceptación de producción ni la evidencia de migración y rollback.

## Estado y siguiente fase

**Fase 1 — Foundation and hardening:** base unificada y baseline de validación local completados.

**Fase 2 — Build:** en curso como siguiente foco de desarrollo. Prioridades:
1. Documentar y validar los contratos canónicos de datos.
2. Confirmar CRUD y persistencia de Tasks, Schedule, planes diarios, recordatorios y Memory.
3. Definir y probar conflictos entre caché local y Firestore.
4. Inventariar datos y rutas heredadas antes de migraciones.
5. Completar CVP/E2E autenticado, verificación manual, PWA y evidencia de rollback antes de release.

El objetivo operativo se mantiene en **$0 de gasto obligatorio**. No retirar los repositorios ni despliegues heredados de To-Do y Timetable hasta cerrar reconciliación de datos, seguridad, aceptación y rollback.

## Documentación del proyecto

- `CONTEXT.md` — arquitectura, restricciones y estado actual.
- `app/docs/ROADMAP.md` — fases, prioridades y criterios de salida.
- `app/docs/QA_MATRIX.md` — baseline automatizado y cola de validación.
- `app/docs/audits/UNIFICATION-AUDIT-2026-10.md` — auditoría de unificación y riesgos de migración.
- `app/docs/INTEGRATION_CONTRACT.md` — contrato de integración.

La documentación distingue funcionalidades implementadas, resultados comprobados y gates de producción aún pendientes. Trabajar directamente sobre `main`; no crear ramas adicionales.

## Créditos

Diseñado y desarrollado bajo la identidad **PALMI-D3V**.

---

*Build · Create · Improve · Validate*
