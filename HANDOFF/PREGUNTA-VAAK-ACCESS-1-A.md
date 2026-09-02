---
artifact_type: PREGUNTA
phase: "0"
ref: "VAAK-ACCESS-1-A"
from: architect_chief
to: humano
status: awaiting_human_decision
blocking: true
created_at: "2026-08-26"
---

# PREGUNTA — Topología temporal de desarrollo

## Pregunta única

¿Cuál de estas dos topologías debe evaluarse como objetivo para el entorno temporal antes de usar datos operativos reales?

| Alternativa | Descripción | Condición pendiente |
|---|---|---|
| A | Frontend y API temporal en Vercel, con backend/datos en cPanel mediante interfaz segura. | Confirmar que cPanel puede exponer API segura, CORS, autenticación y operación sin procesos persistentes. |
| B | Vercel sólo como prototipo/interfaz temporal; monolito Laravel y MySQL en cPanel para entornos con datos operativos. | Confirmar staging, publicación segura, despliegue empaquetado y compatibilidad del dominio temporal. |

No se elige una alternativa en este documento. GitHub es sólo repositorio de código y trazabilidad; no es almacenamiento de datos operativos, adjuntos, respaldos, `.env` ni exportaciones de base de datos. Vercel no es una base de datos. No se configurará acceso remoto a MySQL ni se conectarán servicios hasta recibir decisión humana y evaluación de seguridad.
