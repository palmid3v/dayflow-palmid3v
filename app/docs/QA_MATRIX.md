# DayFlow QA Matrix

## Validation model

| Level | DayFlow implementation |
|---|---|
| V0 Repository Contract | `Validate-CVPProfile.ps1` |
| V1 Domain Validation | `npm run test` |
| V2 Static Quality | `npm run lint` |
| V3 Build / Artifact | `npm run build` + PWA generation |
| V4 Integration | Firebase/Auth/access checks and Firestore Emulator Rules tests |
| V5 CVP | `npm run test:cvp` |
| V6 E2E | `npm run test:e2e` |
| V7 IPV / IST | Interactive verification by the responsible maintainer |
| V8 Production Acceptance | Deployment + smoke + PWA/responsive + rollback evidence |

## Confirmed local baseline — commit `2877bff`

- [x] `firebase emulators:exec --only firestore --project demo-dayflow "npm --prefix app test"`: **33 passed, 0 failed**, including **6 Firestore Rules tests**.
- [x] `npm --prefix app run lint`: passed.
- [x] `npm --prefix app run build`: passed; PWA service-worker generation completed.
- [x] `npm --prefix app audit`: **0 vulnerabilities**.
- [x] `@grpc/grpc-js` resolves to `1.14.6` via the package override, without downgrading Firebase.
- [x] Commit `2877bff` was pushed to `origin/main`; user reported local main up to date and working tree clean.

The expected `PERMISSION_DENIED` emulator log entries occur in negative authorization tests; those tests passed by confirming forbidden writes are denied.

## Fase 1 — DayFlow: CERRADA

El usuario confirma que las pruebas y validaciones acordadas ya se realizaron. Baseline automatizado documentado: 33/33 tests, 6/6 Rules tests, lint/build/PWA aprobados y `npm audit` sin vulnerabilidades. Los controles de backup, reconciliación y rollback siguen aplicando antes de mutaciones destructivas en producción o retiro de sistemas heredados, pero no bloquean el desarrollo de Cupboard.

## Fase 2 — Cupboard como inventario central

Esta fase incorpora espacios separados **Hogar** y **Negocio → Sandwichies**, reutilizando servicios actuales de inventario, movimientos, vencimientos, stock bajo y lista de compras. DayFlow mantiene la planificación; Cupboard, el inventario; Sandwichies, los pedidos y el consumo.

- [ ] Inspeccionar repositorio y servicios actuales de Cupboard antes de diseñar cambios.
- [ ] Definir límites de datos y permisos entre Hogar y Negocio.
- [ ] Verificar persistencia y trazabilidad de movimientos, vencimientos, stock bajo y lista de compras.
- [ ] Probar que un movimiento o consumo no descuente inventario dos veces.
- [ ] Validar permisos, pruebas de dominio, interfaz responsive y recuperación ante errores.

## Cola técnica de validación de DayFlow

Estos checks técnicos de DayFlow siguen abiertos cuando corresponda; no son una petición de repetir el baseline aprobado sin cambios de código.

### Data contracts and persistence
- [ ] Document canonical task, schedule template, occurrence, settings, plan, result, reminder, calendar import/event and memory schemas.
- [ ] Test normalization of legacy aliases and invalid/malformed records at persistence boundaries.
- [ ] Verify task create/edit/complete/reopen/delete persists across refresh and authenticated sessions.
- [ ] Verify schedule recurrence, occurrence overrides/history, settings and overlap confirmation.
- [ ] Verify reminders, daily review and Memory persistence.
- [ ] Verify `.ics` import/clear preserves recurring Schedule templates.
- [ ] Define and test local recovery versus cloud conflict handling; no silent overwrite.

### Access, production data and migration
- [ ] Inventory production Firestore paths, document counts/shapes and legacy schedule fields before migration.
- [ ] Verify deployed Rules and feature flags against the documented access contract.
- [ ] Prepare backup, idempotent migration, count/checksum reconciliation and rollback evidence before any production mutation.
- [ ] Decide and document the Timetable weekly-summary Function's owner/status and $0-budget disposition.
- [ ] Keep legacy repositories/deployments available until migration and release acceptance are evidenced.

### CVP, E2E, manual and PWA
- [ ] Run CVP with dedicated QA credentials or valid Playwright auth state.
- [ ] Run full Playwright E2E.
- [ ] Complete manual IPV/IST on desktop/mobile, keyboard-only navigation, reduced motion, loading/empty/error/access-denied states and responsive overflow.
- [ ] Verify PWA installation, service-worker update, stale-client behavior and rollback.
- [ ] Record deployment, Rules, test, manual verification and rollback evidence before production release.

## ICS calendar import checks

- [ ] With Calendar access enabled, Schedule shows the Import .ics panel.
- [ ] Importing a valid file displays event count, recurrence and source filename.
- [ ] Invalid files or files without events show a useful error without replacing the previous import.
- [ ] Clearing imported events removes only imported calendar events, not recurring Schedule templates.
- [ ] Disabled Calendar access shows an explicit access message.
- [ ] All-day birthdays appear on the correct date and yearly events recur.
- [ ] Month navigation, selected-day details, locations and descriptions work at desktop and mobile widths.
- [ ] No horizontal overflow at 320px, 768px, 1024px and wide desktop.

## Today / Tasks / Dashboard checks

- [ ] Create a task from Today and confirm it appears in Tasks after switching tabs.
- [ ] Complete/reopen a task from Today and confirm consistent status in Tasks.
- [ ] Simulate save failure and confirm prior task state is restored with a visible error.
- [ ] Dashboard totals, open and overdue counts reflect the current user's task data.
- [ ] Priority/overdue labels appear only when applicable.
- [ ] Quick-add and completion controls work with keyboard navigation and narrow viewports.

## Critical Value Path

CVP protects authentication/session access, Today block lifecycle, Tasks lifecycle and Dashboard visibility. Automated scenarios live in `app/e2e/cvp.spec.mjs`.

## Full production E2E

The suite in `app/e2e/dayflow.spec.mjs` covers authentication and Today, Today block CRUD, Tasks CRUD, Schedule CRUD, calendar import/clear, reminders/notifications, Daily Memory, Dashboard, Admin Access Manager, Settings/session controls and browser/runtime errors.

## Release exit criteria

A release is ready only when required automated checks, Rules tests, CVP/E2E, IPV/IST, deployment evidence, security/configuration checks, data reconciliation and rollback evidence are complete. Passing local automated tests does not by itself authorize production migration or legacy retirement.
