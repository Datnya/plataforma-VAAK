-- Esquema de la base de datos de VAAK para MySQL 8.0.
--
-- Reemplaza a Supabase en el hosting del cliente. Solo contiene las tablas que
-- la plataforma usa de verdad: todo lo de proyectos, OC, specs, pagos,
-- proveedores y objetivos vive en un unico documento compartido
-- (vaak_company_data), igual que en Supabase.
--
-- Se importa desde phpMyAdmin (pestana "Importar") en una base de datos vacia.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS vaak_companies (
  id CHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuarios. La contrasena se guarda como hash bcrypt (compatible con los
-- hashes que exporta Supabase), nunca en texto plano.
CREATE TABLE IF NOT EXISTS vaak_profiles (
  id CHAR(36) NOT NULL,
  display_name VARCHAR(200) NOT NULL DEFAULT 'Usuario VAAK',
  username VARCHAR(80) NULL,
  login_email VARCHAR(254) NULL,
  legacy_id VARCHAR(100) NULL,
  password_hash VARCHAR(255) NOT NULL,
  locale VARCHAR(2) NOT NULL DEFAULT 'es',
  active TINYINT(1) NOT NULL DEFAULT 1,
  team VARCHAR(120) NULL,
  position VARCHAR(160) NULL,
  phone VARCHAR(60) NULL,
  avatar_url MEDIUMTEXT NULL,
  last_seen_at DATETIME(3) NULL,
  signed_out_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY vaak_profiles_username_uidx (username),
  UNIQUE KEY vaak_profiles_login_email_uidx (login_email),
  UNIQUE KEY vaak_profiles_legacy_id_uidx (legacy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vaak_user_company_memberships (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  company_id CHAR(36) NOT NULL,
  role ENUM('admin','worker','client') NOT NULL,
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  access JSON NULL,
  project_scope VARCHAR(20) NULL,
  local_project_ids JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY vaak_memberships_user_company_uidx (user_id, company_id),
  KEY vaak_memberships_company_idx (company_id),
  CONSTRAINT vaak_memberships_user_fk FOREIGN KEY (user_id) REFERENCES vaak_profiles (id) ON DELETE CASCADE,
  CONSTRAINT vaak_memberships_company_fk FOREIGN KEY (company_id) REFERENCES vaak_companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sesiones iniciadas. Se guarda el hash del token, no el token.
CREATE TABLE IF NOT EXISTS vaak_sessions (
  token_hash CHAR(64) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_used_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expires_at DATETIME(3) NOT NULL,
  PRIMARY KEY (token_hash),
  KEY vaak_sessions_user_idx (user_id),
  CONSTRAINT vaak_sessions_user_fk FOREIGN KEY (user_id) REFERENCES vaak_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Intentos de inicio de sesion fallidos (bloqueo temporal).
CREATE TABLE IF NOT EXISTS vaak_auth_rate_limits (
  attempt_key VARCHAR(128) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  window_started_at DATETIME(3) NOT NULL,
  blocked_until DATETIME(3) NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (attempt_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Evita crear el mismo usuario dos veces si el navegador reintenta.
CREATE TABLE IF NOT EXISTS vaak_user_provisioning (
  idempotency_key CHAR(36) NOT NULL,
  company_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  legacy_id VARCHAR(100) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (idempotency_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- El documento compartido de la empresa (proyectos, OC, specs, pagos...).
-- revision permite detectar si otra persona guardo antes (control optimista).
CREATE TABLE IF NOT EXISTS vaak_company_data (
  company_id CHAR(36) NOT NULL,
  state LONGTEXT NOT NULL,
  revision BIGINT NOT NULL DEFAULT 1,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_by CHAR(36) NULL,
  PRIMARY KEY (company_id),
  CONSTRAINT vaak_company_data_company_fk FOREIGN KEY (company_id) REFERENCES vaak_companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copias de las ultimas 150 versiones del documento compartido.
CREATE TABLE IF NOT EXISTS vaak_company_data_history (
  id BIGINT NOT NULL AUTO_INCREMENT,
  company_id CHAR(36) NOT NULL,
  revision BIGINT NOT NULL,
  state LONGTEXT NOT NULL,
  updated_by CHAR(36) NULL,
  saved_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY vaak_company_data_history_company_idx (company_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Imagenes del documento compartido. El id es el SHA-256 del archivo.
CREATE TABLE IF NOT EXISTS vaak_company_assets (
  company_id CHAR(36) NOT NULL,
  id CHAR(64) NOT NULL,
  mime VARCHAR(40) NOT NULL,
  data LONGBLOB NOT NULL,
  byte_size INT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_by CHAR(36) NULL,
  PRIMARY KEY (company_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vaak_audit_events (
  id BIGINT NOT NULL AUTO_INCREMENT,
  company_id CHAR(36) NULL,
  actor_user_id CHAR(36) NULL,
  action VARCHAR(80) NOT NULL,
  resource_type VARCHAR(40) NOT NULL,
  resource_id VARCHAR(100) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY vaak_audit_company_idx (company_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
