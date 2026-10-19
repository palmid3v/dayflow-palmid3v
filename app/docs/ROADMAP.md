# Roadmap — DayFlow

## Product direction

DayFlow is the single productivity application in the PALMI-D3V ecosystem. It brings Today, Tasks, Schedule, Calendar imports, Reminders, Dashboard, Memory and access management into one React/Vite/PWA application backed by Firebase Authentication and Cloud Firestore.

Product principles:
- One application and one Firebase identity.
- `users/{uid}/tasks/{taskId}` remains the canonical task store; other domains reference task IDs instead of duplicating task documents.
- Firestore is the cloud source of truth; local storage is a recovery/cache layer.
- Enforce user isolation and feature access in Firestore Rules, not only in the UI.
- Preserve the $0 mandatory-service budget; do not introduce paid services as a default dependency.
- Keep To-Do and Timetable repositories/deployments as migration and rollback evidence until data and operational ownership are reconciled.

## Phase 1 — Cerrar DayFlow (To-Do + Timetable)

**Estado: CERRADA.** El usuario confirma que se ejecutaron las pruebas y validaciones acordadas. Se acepta la Fase 1 como cerrada para avanzar; las comprobaciones operativas de producción y rollback quedan como controles previos a cualquier migración destructiva o retiro de sistemas heredados, no como motivo para bloquear el inicio de Cupboard.

**Objetivo:** terminar la unificación de To-Do y Timetable y validar tareas, horarios, calendario, recordatorios, permisos y migración de datos.

**Resultado esperado:** un centro de productividad confiable, sin dos fuentes de tareas ni dos fuentes de horarios.

- [x] Daily planning and execution states.
- [x] Tasks feature and task completion/reopen behavior.
- [x] Recurring Schedule feature, overlap warning and explicit save-anyway flow.
- [x] Calendar `.ics` import and recurring schedule export.
- [x] Reminders, daily review and Memory.
- [x] Dashboard and admin/access manager.
- [x] Responsive baseline, PWA generation and Dark Premium shell.
- [x] DayFlow-owned Firestore model and feature-aware access policy.
- [x] Firestore Rules allow/deny test harness.
- [x] Local test suite: **33/33 passed**, including **6/6 Firestore Rules tests**.
- [x] ESLint passed.
- [x] Production build and PWA service-worker generation passed.
- [x] Dependency remediation: `@grpc/grpc-js` overridden to `1.14.6`; `npm audit` reports **0 vulnerabilities**.
- [x] Commit `2877bff` pushed to `origin/main`; local working tree clean at the last reported check.

## Phase 2 — Cupboard como inventario central

**Estado: siguiente fase; no confundir con el trabajo pendiente de cierre de DayFlow.**

**Objetivo:** incorporar en el ecosistema un espacio separado llamado Cupboard para **Hogar** y **Negocio → Sandwichies**, reutilizando los servicios actuales de inventario y evitando duplicar la lógica que ya existe.

**Resultado esperado:** saber qué hay disponible y qué hace falta comprar desde un solo sitio, manteniendo separados los contextos de Hogar y Negocio.

### Alcance funcional
- [ ] Revisar el repositorio y los servicios actuales de Cupboard antes de implementar; reutilizar inventario, movimientos, vencimientos, alertas de stock bajo y lista de compras.
- [ ] Definir los límites de datos y la navegación de los espacios **Hogar** y **Negocio → Sandwichies**.
- [ ] Conservar un único registro canónico por artículo dentro de cada espacio; movimientos de stock deben ser trazables y no duplicarse.
- [ ] Mostrar cantidades disponibles, movimientos, vencimientos, niveles bajos y lista de compras en una experiencia coherente.
- [ ] Integrar Sandwichies como contexto de negocio de Cupboard sin mezclar existencias domésticas con existencias del negocio.
- [ ] Definir el contrato para que pedidos/consumo confirmados de Sandwichies descuenten ingredientes de Cupboard de forma idempotente, sin descuentos duplicados.
- [ ] Mantener DayFlow responsable del tiempo y la planificación; Cupboard responsable del inventario; Sandwichies responsable de pedidos y consumo.
- [ ] Añadir pruebas de dominio, persistencia, permisos, movimientos de stock, vencimientos, stock bajo y lista de compras.
- [ ] Mantener el objetivo de **$0 de gasto obligatorio** y no reemplazar servicios existentes sin evidencia de necesidad.

### Estado de cierre de Phase 1 — DayFlow
- [x] Fase 1 marcada como cerrada por confirmación del usuario de que las pruebas acordadas ya se realizaron.
- [x] Baseline automatizado documentado: 33/33 pruebas, 6/6 Rules tests, lint, build/PWA y audit sin vulnerabilidades.
- [x] Unificación de To-Do y Timetable aceptada como objetivo funcional de la fase.
- [ ] Antes de cualquier mutación de datos de producción o retiro de sistemas heredados, conservar evidencia verificable de backup, reconciliación y rollback. Este control no bloquea el trabajo de Fase 2.

### Secuencia de trabajo
1. **Fase 1 cerrada:** no repetir el baseline aprobado sin una regresión o cambio relevante.
2. **Auditar Cupboard:** localizar los repositorios y servicios actuales y mapear sus contratos antes de modificar código.
3. **Construir Cupboard central:** separar Hogar y Negocio → Sandwichies y reutilizar los servicios existentes.
4. **Conectar consumo de Sandwichies:** descontar stock de manera idempotente cuando corresponda.
5. **Validar Fase 2:** pruebas automatizadas, escenarios de inventario y aceptación manual antes de desplegar.

### Criterios de salida de Phase 2
- Hogar y Negocio → Sandwichies están claramente separados y usan los servicios actuales de Cupboard.
- Movimientos, vencimientos, stock bajo y lista de compras son consistentes y persistentes.
- Los movimientos de inventario y descuentos derivados de consumo/pedidos no se duplican.
- Las pruebas de dominio, permisos y flujos principales pasan.
- El cierre de DayFlow, la migración y cualquier despliegue mantienen evidencia separada; no se declara aprobado lo que no se haya ejecutado.

## Validation reference

Use the scripts from `app/`:
- `npm run test` — domain/unit tests.
- `npm run lint` — static quality.
- `npm run build` — production build and PWA generation.
- `npm run test:rules` — Firestore rules tests; run with the Firestore emulator.
- `npm run test:cvp` — Critical Value Path.
- `npm run test:e2e` — full Playwright E2E.
- `npm run validate:static` and `npm run validate` — validation runner.

The confirmed local rules-suite command is:
`firebase emulators:exec --only firestore --project demo-dayflow "npm --prefix app test"`

## Product principle

DayFlow coordinates the day without becoming a second task database or calendar source of truth. One application, one Firebase identity, user-scoped data, and no mandatory paid service.

## Checkpoint — 2026-10-19

Baseline de código reportado: `2877bff` (`fix: update vulnerable grpc dependency`); después se actualizaron documentos de roadmap en `main`. Local validation passed: **33/33 tests**, including **6/6 Firestore Rules tests**; lint passed; production build and PWA generation passed; `npm audit` reported **0 vulnerabilities**. The dependency override is `@grpc/grpc-js@1.14.6`. The user confirmed the branch set is up to date and asked to move forward rather than repeat validation.

La prioridad inmediata es cerrar los gates funcionales y de datos de DayFlow. Cupboard es la siguiente fase de producto, pero su implementación debe comenzar con una inspección de sus servicios existentes. Nunca describir un gate de producción o migración no ejecutado como aprobado.
