-- Actualizacion 2 (19-sep-2026): tabla del registro de accesos de clientes.
-- Se importa UNA vez en phpMyAdmin en cada base ya instalada (prueba y oficial).
SET NAMES utf8mb4;

-- Registro de accesos de clientes (herramienta «Registro de acceso de clientes»).
CREATE TABLE IF NOT EXISTS vaak_client_access_log (
  id BIGINT NOT NULL AUTO_INCREMENT,
  company_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  name VARCHAR(200) NOT NULL,
  position VARCHAR(160) NOT NULL DEFAULT '',
  project VARCHAR(1000) NOT NULL DEFAULT '',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY vaak_access_log_company_idx (company_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
