---
artifact_type: PROJECT_BRAIN
phase: "governance"
ref: "VAAK-BRAIN-1-A"
from: architect_chief
to: reviewer_auditor
status: active
blocking: false
created_at: "2026-08-26"
updated_at: "2026-08-26"
---

# PROJECT-BRAIN.md — Contexto estable de Plataforma VAAK

> Convención interna de VAAK, no autodescubierta por Codex. Se lee porque `AGENTS.md` lo exige; no sustituye a `PROJECT-STATE.md`, a los ADR ni a los handoffs. No existe un fallback `CHATGPT.md` en esta REF.

## 1. Propósito y modo de uso

Este documento conserva el contexto estable y verificable para retomar la modernización de Plataforma VAAK. Antes de planificar, auditar o ejecutar, leerlo junto con `PROJECT-STATE.md` y los artefactos de la REF aplicable.

Su función es evitar que las sesiones dependan de memoria de chat. La memoria de ChatGPT/Codex y un ChatGPT Project pueden ayudar a recordar, pero no son fuentes canónicas del repositorio. [Verificado: decisión de gobierno VAAK-BRAIN-1-A]

## 2. Ámbitos, fuentes y resolución de conflictos

No hay una precedencia única: cada documento manda en su ámbito.

| Ámbito | Precedencia |
|---|---|
| Reglas y decisiones normativas | Instrucción humana vigente → `AGENTS.md` → ADR aprobado → handoff aprobado de la REF activa |
| Contexto estable | Evidencia primaria y decisiones humanas/ADR aprobados → este Brain como resumen derivado |
| Estado actual | Evidencia reciente y VEREDICTO aplicable → `PROJECT-STATE.md` como resumen derivado |

Los archivos reales, hashes y salidas verificables prevalecen sobre cualquier resumen descriptivo. Ante una contradicción, registrar HALLAZGO; no corregir ni decidir silenciosamente. [Verificado: `AGENTS.md`, ORDEN VAAK-BRAIN-1-A]

## 3. Identidad y objetivo de negocio

Plataforma VAAK modernizará la gestión empresarial de la clienta y sustituirá un software legado local, lento y sin acceso remoto suficiente por una plataforma web multiusuario. El resultado debe permitir trabajo desde ubicaciones distintas de la oficina. [Decisión humana]

Los objetivos duraderos son rapidez, una experiencia minimalista y moderna, seguridad multiusuario, trazabilidad y mantenibilidad. [Decisión humana]

## 4. Usuarios, dominio y glosario estable

El dominio cubre gestión de proyectos y compras de FF&E/OS&E. Su vocabulario central incluye proyecto, área, ambiente, ítem SPEC, fabricante/proveedor, orden de compra, factura, pago, entrega, presupuesto, moneda y auditoría. [Verificado: corpus legado y requerimiento OS&E]

Los roles funcionales aprobados son Admin, Worker y Client. Admin supervisa y administra usuarios/accesos; Worker opera dentro de proyectos asignados; Client consulta únicamente reportes y Purchase Orders autorizadas, mientras el tracking público permanece separado y mínimo. Los detalles de autorización, seguridad y segregación aún pendientes se mantienen en los contratos vivos y la matriz funcional. [Verificado: VAAK-FUNCTIONAL-1-A y VAAK-ACCESS-1-B]

## 5. Alcance, límites e invariantes

La plataforma debe conservar y modernizar las capacidades documentadas del sistema antiguo, incluyendo configuración de proyectos, áreas/ambientes, SPEC, cantidades, proveedores, cargos, moneda y reportes; además debe considerar importación de SPEC, órdenes de compra, facturas/pagos, entregas, paneles, alertas, exportación y auditoría solicitados para OS&E. [Verificado: corpus autorizado]

No hay stack final, ADR tecnológico ni aplicación persistente autorizada. Existe únicamente un prototipo visual local, estático y descartable aprobado bajo `VAAK-IMPLEMENTATION-1-A`; no contiene backend, persistencia, cuentas ni despliegue. Las decisiones de producto y ADR siguen bajo autoridad humana. [Verificado: VEREDICTO VAAK-IMPLEMENTATION-1-A]

## 6. Principio de adecuación al hosting

La solución final debe ajustarse a las capacidades reales del hosting vigente de la clienta y no debe asumir acceso root, contenedores, procesos persistentes ni servicios externos sin evidencia. Las cifras, cuotas, versiones, panel, límites y estado de verificación son volátiles: consultar `PROJECT-STATE.md` y el futuro artefacto de restricciones de hosting antes de decidir. [Decisión humana]

La ubicación del frontend durante desarrollo y el dominio oficial final son decisiones operativas separadas de la ubicación real del backend y almacenamiento. [Decisión humana]

## 7. Mapa de fuentes canónicas

- `AGENTS.md`: reglas obligatorias y frenos humanos.
- `PROJECT-STATE.md`: avance, evidencia reciente, riesgos, preguntas y siguiente paso.
- `HANDOFF/`: ORDEN, ENTREGA, HALLAZGO y VEREDICTO trazables por REF.
- `docs/research/VAAK-RESEARCH-0-A/00-source-manifest.md`: procedencia e integridad del corpus obligatorio.
- `Documentos de plataforma antigua/` y `OS&E_Requerimiento Sistema (1).pdf`: corpus fuente autorizado.

NotebookLM es una herramienta de investigación, no una fuente canónica autónoma. Su contenido debe poder rastrearse al corpus o a evidencia aprobada. [Decisión de gobierno]

## 8. Gobierno proporcional y handoff selectivo

El flujo normal es ejecución directa para tareas pequeñas, claras, locales y reversibles. El ciclo `architect_chief` → `reviewer_auditor` se activa sólo por petición humana expresa o cuando una tarea presenta complejidad o riesgo material —arquitectura transversal, seguridad, datos, producción, despliegue, infraestructura o decisiones costosas de revertir— y una revisión independiente aporta valor claro. [Decisión humana 2026-08-26; `AGENTS.md`]

Cuando se activa, los agentes trabajan secuencialmente, conservan una REF estable, tienen un máximo de tres ciclos y escalan un RECHAZADO al humano. Fuera de ese ciclo, Codex puede mantener Brain y State directamente según el alcance autorizado. El humano conserva autoridad sobre producto, ADR, frenos y alcance material. Este Brain está activo después del VEREDICTO final aprobado de `VAAK-BRAIN-1-A`. [Verificado: ORDEN y VEREDICTO VAAK-BRAIN-1-A]

## 9. Índice de decisiones

No hay ADR tecnológico aprobado. La investigación de modernización usa `VAAK-RESEARCH-0-A`; los requisitos funcionales aprobados usan `VAAK-FUNCTIONAL-1-A`; la referencia UX usa `VAAK-UX-1-A`; y el prototipo visual cerrado usa `VAAK-IMPLEMENTATION-1-A`. La recomendación Laravel/PHP permanece condicionada y la REF `VAAK-HOSTING-1-A` terminó formalmente rechazada. Consultar los handoffs correspondientes en lugar de duplicar decisiones o resultados volátiles. [Verificado: artefactos HANDOFF]

## 10. Principios de calidad, seguridad y trazabilidad

- Preservar trazabilidad entre fuente, requisito, decisión y verificación.
- No tratar manuales como sustituto de la validación con usuarios.
- No registrar secretos, credenciales, tokens ni datos personales innecesarios en documentación de gobierno.
- Aplicar controles de acceso, historial de cambios y auditoría como necesidades de dominio a concretar en fases aprobadas.
- Antes de usar fuentes externas, verificar propiedad, alcance y tratamiento de datos aplicable.

[Verificado: `AGENTS.md` y ORDEN VAAK-RESEARCH-0-A]

## 11. Herramientas e integraciones disponibles

Codex trabaja sobre este workspace y puede usar el MCP de NotebookLM cuando esté instalado y autenticado en el equipo activo. La configuración, ejecutable y sesión son dependientes del dispositivo y deben revalidarse después de una transferencia. La disponibilidad de una integración no aprueba cargar datos, compartir contenido, activar proveedores ni usar credenciales; se aplican los frenos humanos. [Verificado: estado de investigación, `mcp_config.json` y `AGENTS.md`]

## 12. Mantenimiento y procedencia

Mantenimiento ordinario: Codex. Cuando se activa handoff: propietario `architect_chief` y verificador independiente `reviewer_auditor`. Autoridad de producto y ADR: humano.

Actualizar este Brain solo por cambio humano estable, ADR aprobado, invariante nuevo o corrección factual demostrada. Registrar la fuente y motivo en el cambio. El estado dinámico, riesgos, hallazgos, identificadores operativos, resultados de pruebas y progreso pertenecen a `PROJECT-STATE.md` o a artefactos de investigación; no se duplican aquí.
