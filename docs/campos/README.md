# Diccionario de formularios de VAAK

Tres documentos que explican **campo por campo** los formularios centrales de la plataforma:
qué hace cada campo, cómo se llama por dentro, de dónde saca su contenido, qué obliga, qué
calcula solo y dónde vuelve a salir después (tarjetas, documentos impresos, reportes).

| Documento | Cubre |
| --- | --- |
| [CAMPOS-SPEC.md](CAMPOS-SPEC.md) | Formulario de spec: 18 campos, ficha técnica, tope de compra, cambio de spec |
| [CAMPOS-ORDEN-DE-COMPRA.md](CAMPOS-ORDEN-DE-COMPRA.md) | Formulario de OC: 27 campos, numeración, totales, seguimiento, cambio de orden |
| [CAMPOS-REQUERIMIENTO-DE-PAGO.md](CAMPOS-REQUERIMIENTO-DE-PAGO.md) | Formulario de RP: relleno desde la OC, desglose, saldo, registro del pago |

## Para qué se escribieron (24-sep-2026)

Antes de cambiar la forma de guardar los datos (pasar specs, órdenes y requerimientos a sus
propias tablas de MySQL, para que sean ilimitados), hacía falta dejar por escrito **todo lo que
hoy funciona**. Así, después del cambio, nadie tiene que recordar de memoria cómo se comportaba
cada campo: se lee aquí y se comprueba.

Cada documento termina con dos secciones que son las importantes para esa migración:

- **«Lo que no se puede perder al cambiar el guardado»**: la lista corta de comportamientos que
  tienen que seguir exactamente igual.
- **«Pruebas que lo verifican»**: qué paso de `bash servidor-php/pruebas/probar.sh` lo comprueba.

## Cómo mantenerlos

- Si se cambia un campo de uno de estos formularios, **se actualiza su documento en el mismo
  commit**, igual que `ESTADO-ACTUAL.md`.
- Si el código y el documento se contradicen, **gana el código**: hay que corregir el documento.
- No se copian aquí datos del cliente: solo cómo funciona la plataforma.
