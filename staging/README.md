# VAAK staging temporal

Aplicación separada del prototipo local. Usa Next.js en Vercel y Supabase para autenticación, PostgreSQL, RLS y Storage privado. El entorno admite únicamente identidades y datos ficticios.

## Configuración local

1. Copiar `.env.example` a `.env.local` y completar la URL y clave publicable de Supabase.
2. Aplicar `supabase/migrations/202608280001_staging_foundation.sql` en el SQL Editor de Supabase.
3. Aplicar `supabase/seed.sql`.
4. Crear usuarios ficticios desde Supabase Auth y asignar sus membresías mediante SQL controlado.
5. Ejecutar `npm install` y `npm run dev`.

Nunca debe colocarse una clave `secret` o `service_role` en variables `NEXT_PUBLIC_*`, archivos del repositorio, navegador o documentación.
