---
artifact_type: SOURCE_MANIFEST
phase: "R0"
ref: "VAAK-RESEARCH-0-A"
from: architect_chief
to: reviewer_auditor
status: in_progress
blocking: true
created_at: "2026-08-25"
---

# Manifiesto inicial del corpus obligatorio

**Workspace raíz:** `C:\Users\HP\OneDrive\Desktop\Plataforma VAAK`

**Alcance de este checkpoint:** identidad e integridad binaria. No se abrió ni analizó el contenido funcional. Los conteos de páginas/secciones, la extracción, el escaneo de secretos y el análisis profundo quedan pendientes.

## Resumen verificable

| Métrica | Resultado |
|---|---:|
| Documentos obligatorios esperados | 12 |
| Documentos encontrados | 12 |
| DOCX | 11 |
| PDF | 1 |
| Tamaño total | 5,240,006 bytes |
| Algoritmo de integridad | SHA-256 |
| Archivos con hash calculado | 12 |
| Conteo de páginas/secciones | Pendiente |
| Análisis profundo | Pendiente |

## Archivos

| ID lógico | Ruta relativa exacta | Tipo | Tamaño (bytes) | SHA-256 | Páginas/secciones | Análisis profundo |
|---|---|---:|---:|---|---|---|
| LEG-01 | `Documentos de plataforma antigua\Exx-AddingAreaQuantities-Español.docx` | DOCX | 116,177 | `691eca4254c344e3597173e2c0e004befa9ddb638b6a8215737d967ea8913625` | Pendiente | Pendiente |
| LEG-02 | `Documentos de plataforma antigua\Exx-AddingRoomQties-Español.docx` | DOCX | 334,684 | `7bdc5b214e25f74870e991a02639af55ee38b4d3576474c1b510d0671e41ba65` | Pendiente | Pendiente |
| LEG-03 | `Documentos de plataforma antigua\Exx-DetailingSpecItems-Español.docx` | DOCX | 302,914 | `6a11e52bbc98e55a41f2e3bdcd4d37b1f41d602f95851534e1bcc7b10736161c` | Pendiente | Pendiente |
| LEG-04 | `Documentos de plataforma antigua\Exx-EnteringSpecItems-Español.docx` | DOCX | 471,606 | `21c5840d88b0aaaf04955a29976275fcc53b863f371ec1f35e77928d34e501b7` | Pendiente | Pendiente |
| LEG-05 | `Documentos de plataforma antigua\Exx-Manufacturers-Sources-Español.docx` | DOCX | 389,886 | `5f4661ee404a1c6dde7bafba5d08d2ad2fe595f502ac87ff929fd5e5a11f1970` | Pendiente | Pendiente |
| LEG-06 | `Documentos de plataforma antigua\Exx-SetupProject-Español.docx` | DOCX | 807,532 | `adecebeda0892d52d6c6d464031c436b5a909814fc981dbaaeb4d464c3947858` | Pendiente | Pendiente |
| LEG-07 | `Documentos de plataforma antigua\Exx-SetupProjectAreas-Español.docx` | DOCX | 613,760 | `c609ff2039c4b7e424df26a2d0ab19c8fe22493c4918d77bfc12ed422347a9ba` | Pendiente | Pendiente |
| LEG-08 | `Documentos de plataforma antigua\Exx-SpecInstructions-Español.docx` | DOCX | 701,945 | `87d381f92e74180d7f51c67f5b2f8f860809f136b2b0274d475db22dae971892` | Pendiente | Pendiente |
| LEG-09 | `Documentos de plataforma antigua\Exx-SpecItemCharges-Español.docx` | DOCX | 501,502 | `d29d8f0712540c4a905fede0f668e27c97b29f540f6a4acc465dfb1fdcb7a7ac` | Pendiente | Pendiente |
| LEG-10 | `Documentos de plataforma antigua\Exx-SpecItemRpts-Español.docx` | DOCX | 270,692 | `dea8b0b18928b91745943c3903b3bd07f45ca614aec0f50a71aa29fb5fa6fc2e` | Pendiente | Pendiente |
| LEG-11 | `Documentos de plataforma antigua\Exx-WorkingwCurrency-Español.docx` | DOCX | 516,089 | `b4d15b4e58b3c4b23a48cd1627ecd171511551d8ac3ab75b344c3268d83ee863` | Pendiente | Pendiente |
| NEW-01 | `OS&E_Requerimiento Sistema (1).pdf` | PDF | 213,219 | `6aafc9084660910b02da6874ee4ec62c345979e812dffe8329ec7bbc0e168af0` | Pendiente | Pendiente |

## Estado por control

| Control | Estado | Evidencia/nota |
|---|---|---|
| Existencia del corpus | Verificado | 12/12 rutas resueltas localmente |
| Tamaño en bytes | Verificado | Metadatos del sistema de archivos del 2026-08-25 |
| SHA-256 | Verificado | `Get-FileHash -Algorithm SHA256` sobre cada ruta exacta |
| Originales modificados | No | Solo operaciones de lectura |
| Conteo de páginas DOCX/PDF | Pendiente | No ejecutado por límite explícito del checkpoint |
| Conteo de secciones | Pendiente | Requiere extracción estructural posterior |
| Tablas/figuras/capturas | Pendiente | Requiere renderizado/revisión visual posterior |
| Detección de secretos/datos sensibles | Pendiente | Debe completarse antes de cualquier carga remota |
| Extracción para `notebook_add_text` | Pendiente | Se realizará mediante copias de trabajo trazables |
| Análisis funcional profundo | Pendiente | Corresponde a R1–R3, no a este checkpoint |

## Exclusión registrada

`VAAK PROCUREMENT - FF&E INPUTS (1).pdf` no forma parte de estos doce documentos obligatorios. Permanece fuera del manifiesto operativo hasta respuesta humana a la pregunta abierta correspondiente.

## Próxima actualización del manifiesto

Completar páginas/secciones, método y versión de extracción, clasificación previa de secretos/datos sensibles, inventario de elementos visuales y estado de incorporación lógica/remota. Cualquier cambio de bytes o SHA-256 debe generar HALLAZGO antes de continuar.
