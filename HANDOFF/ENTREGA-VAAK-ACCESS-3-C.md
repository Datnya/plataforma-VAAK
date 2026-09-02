---
artifact_type: ENTREGA
phase: "implementation"
ref: "VAAK-ACCESS-3-C"
from: codex_executor
to: reviewer_auditor
status: delivered_for_audit
blocking: false
created_at: "2026-08-31"
---

# Entrega VAAK-ACCESS-3-C

## Resultado

Implementación local entregada para auditoría, sin deploy. El administrador puede crear y editar usuarios, seleccionar rol, conceder, deshabilitar o retirar accesos y asignar proyectos u órdenes autorizadas. La autorización de rutas, recursos, apertura y guardado pasa por un único runtime que relee STORE y SESSION. El logo del login se renderiza completo, centrado y sobre las demás capas.

## Archivos

| Archivo | Cambio |
|---|---|
| `prototype/access-control.js` | Política privada deny-by-default, validación, migración pura, selectores y draft monotónico. |
| `prototype/access-runtime.js` | Dispatcher, tokens de operación, reautorización fresca y única escritura STORE. |
| `prototype/access-test-fixtures.js` | Seed limpio Admin/Worker/Client A/Client B. |
| `prototype/app.js` | UI por política, editor de accesos/alcances ES/EN y formularios locales. |
| `prototype/refinements.css` | Logo de login por encima de capas y editor responsive. |
| `prototype/index.html` | Orden de carga local, sin dependencias externas. |
| `prototype/access-*.test.js`, `access-verify.js` | Suites unitarias, runtime, integración, aceptación, evidencia y runner padre. |
| `prototype/access-browser-harness.html/js` | Harness visual aislado ES/EN. |
| `prototype/README.md` | Cuentas, STORE/SESSION, recuperación y límites. |
| `docs/functional/VAAK-ROLE-PERMISSIONS.md` | Estado 3-C reconciliado como entregado para auditoría. |
| `HANDOFF/evidence/VAAK-ACCESS-3-C/` | 20 PNG y un único `manifest.json`. |

No existe raíz Git verificable (`.git = false`), por lo que no hay diff, commit, push ni merge. No se modificaron `LOGO VAAK.png`, `prototype/assets/`, staging, backend, Supabase, Vercel ni hosting.

## Integridad

- Logo SHA-256: `840004A7CB7F417A0C300C85E18621335978A0E5C7FD4D4847660404CD1C362E`.
- Assets: exactamente 4; hashes preservados `9143164D…`, `E2BB7ADD…`, `531E5648…`, `7C63B76A…`.
- `access-control.js`: `EFF4F4C732B526D23655733450B8AB3AACCD5AC0A35FD6180470DAB27ED5E3DA`.
- `access-runtime.js`: `95803F2C3E9349F84535868C1C1DC84FEFDF8345395BCBAC161A6E15BD09EF11`.
- `app.js`: `9A779DA1F9BD3A19D81FCD81EFE7543ADF5BBDD7123B3320DDE28F50388A6DB2`.
- Evidencia manifest: `D4164D84F27615AC8FBB0CC162A557DDE081F64969CFEFF9F88F7B55A03C3789`.

## Matriz ejecutada

| Bloque | Criterios | Resultado | Evidencia |
|---|---:|---|---|
| Catálogo, policy, scope y consumidores | C01–C18 | PASS | unit/runtime/source |
| Migración, drafts y grants | C19–C28 | PASS | snapshots/storage/reducer |
| Fronteras, invariantes y frescura | C29–C36 | PASS | runtime/storage/i18n/source |
| Flujos visuales y filesystem | C37–C38 | PASS | 20 PNG + callbacks + manifest |
| Runner padre no recursivo | C39 | PASS | child list y evidencia de corrida actual |

Las subaserciones exactas, fixtures y expectativas son las de `HANDOFF/ORDEN-VAAK-ACCESS-3-C.md` §8.1 y están congeladas en `prototype/access-verify.js`.

## Salida literal final

```text
C01 PASS
C02 PASS
C03 PASS
C04 PASS
C05 PASS
C06 PASS
C07 PASS
C08 PASS
C09 PASS
C10 PASS
C11 PASS
C12 PASS
C13 PASS
C14 PASS
C15 PASS
C16 PASS
C17 PASS
C18 PASS
C19 PASS
C20 PASS
C21 PASS
C22 PASS
C23 PASS
C24 PASS
C25 PASS
C26 PASS
C27 PASS
C28 PASS
C29 PASS
C30 PASS
C31 PASS
C32 PASS
C33 PASS
C34 PASS
C35 PASS
C36 PASS
C37 PASS
C38 PASS
C39 PASS
39/39 PASS
```

Comando: `node prototype/access-verify.js`.

## Evidencia visual

- Run ID: `VAAK-ACCESS-3-C-1788237110154`.
- Edge: `152.0.4191.53`.
- 20 capturas PNG de `1440×1000`, dos por escenario ES/EN.
- 20 tokens correlacionados no reutilizados; 20 hashes SHA-256; red limitada a `127.0.0.1`, `data:` y `blob:`.
- Directorio exacto: 21 archivos (20 PNG + manifest), sin Markdown interno.

## Trazas e invariantes

- Policy, handlers, resolvers y tokens no se exportan; metadatos públicos están congelados.
- Una definición de `dispatchAction`, `renderCurrentRoute`, `navigateTo`, `openAuthorizedOperation` y `commitState`.
- Una escritura STORE central; validación y control de concurrencia antes de persistir.
- Migración no muta input, no comparte referencias y no convierte relaciones ambiguas en permisos; las pone en quarantine.
- Supplier `mixed` se puede listar contextualmente y no se puede editar; Specs y órdenes respetan proyecto/cliente.
- Client A sólo lista/previsualiza O1; Client B sólo O2; descarga y mutaciones están denegadas.
- `revision` aumenta al cambiar identidad, rol, grant o scope; `confirmedRevision` queda obsoleto hasta nueva confirmación.
- La revocación entre open/commit y el cambio concurrente producen denegación y cero escrituras.
- SESSION es única por origen; storage events cierran operaciones obsoletas en otras pestañas.

## Desviaciones y límites

- Los roles personalizados de handoff no pudieron ejecutarse por incompatibilidad del modelo fijado en su configuración; la planificación y las tres revisiones se realizaron con agentes independientes por defecto y R3 quedó APROBADO antes de implementar.
- En Windows, `msedge.exe --version` devolvió el texto de sesión existente; el manifiesto conserva esa salida literal y registra además `VersionInfo.ProductVersion = 152.0.4191.53`.
- Es una simulación de navegador con datos ficticios. No ofrece seguridad real, backend, RLS, auditoría inmutable ni aislamiento frente a DevTools.
- No se hizo deploy. La URL online temporal no recibió estos cambios.
