<?php
// Copia este archivo como config.php (en esta misma carpeta) y completa los datos.
// config.php NUNCA se sube al repositorio: tiene las claves de la base de datos.
return [
  // Base de datos MySQL creada en cPanel (Bases de datos MySQL).
  'db' => [
    'host' => 'localhost',
    'port' => 3306,
    'nombre' => 'usuariocpanel_vaak',
    'usuario' => 'usuariocpanel_vaak',
    'clave' => 'CAMBIAR',
  ],
  // Texto aleatorio largo (minimo 32 caracteres). Distinto en prueba y en oficial.
  'secreto_hmac' => 'CAMBIAR-POR-UN-TEXTO-ALEATORIO-LARGO',
  // Direcciones desde las que se permite escribir, separadas por coma.
  // Si se deja vacio, se acepta solo el propio dominio.
  'origenes' => '',
  // 'prueba' u 'oficial'. Solo se muestra en /api/health.
  'entorno' => 'prueba',
  'release_id' => 'local',
];
