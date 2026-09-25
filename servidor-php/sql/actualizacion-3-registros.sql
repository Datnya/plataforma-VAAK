-- Etapa 1 de la migración del guardado (25-sep-2026).
--
-- Cada spec, cada orden de compra y cada requerimiento de pago pasa a tener SU PROPIA FILA,
-- en vez de vivir dentro del documento único de la empresa (vaak_company_data). El documento
-- se queda con lo demás: proyectos, proveedores, usuarios, catálogos y objetivos.
--
-- Nada se borra: la migración COPIA los registros a esta tabla y solo vacía las listas del
-- documento cuando la copia quedó verificada, dentro de la misma transacción.
--
-- Se importa desde phpMyAdmin (pestaña «Importar») sobre la base ya existente.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS vaak_company_records (
  company_id CHAR(36)     NOT NULL,
  kind       VARCHAR(16)  NOT NULL,                  -- spec | order | invoice
  id         VARCHAR(120) NOT NULL,                  -- el id del propio registro (sp-…, o-…, inv-…)
  project_id VARCHAR(120) NOT NULL DEFAULT '',
  created_at VARCHAR(40)  NOT NULL DEFAULT '',       -- la fecha del registro, para ordenar
  pos        INT          NOT NULL DEFAULT 0,        -- su lugar en la lista original, para devolverla igual
  hash       CHAR(32)     NOT NULL,                  -- para no reescribir lo que no cambió
  updated_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  data       LONGTEXT     NOT NULL,                  -- el registro completo, tal cual
  PRIMARY KEY (company_id, kind, id),
  KEY vaak_records_listado (company_id, kind, project_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
