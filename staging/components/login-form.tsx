export function LoginForm({ hasError = false }: { hasError?: boolean }) {
  return (
    <form action="/api/auth/login" method="post" className="login-form">
      <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
      <label>Contraseña<input name="password" type="password" autoComplete="current-password" required /></label>
      {hasError ? <p className="form-error" role="alert">No pudimos iniciar sesión. Verifica tus credenciales.</p> : null}
      <button className="button button-primary" type="submit">Ingresar →</button>
    </form>
  );
}
