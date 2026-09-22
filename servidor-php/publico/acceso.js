// Pantalla de inicio de sesión publicada (22-sep-2026). Es lo único que descarga alguien sin
// sesión: el código de las pantallas internas lo entrega el servidor (/api/app) solo después de
// iniciar sesión, como en la banca en línea. La pantalla ya viene dibujada en index.html (siempre
// en inglés, por decisión de Datnya); aquí solo se atienden el formulario y el botón del ojo.
(() => {
  "use strict";
  const APP = document.currentScript.dataset.app;
  const ESTILOS = document.currentScript.dataset.estilos;
  let csrf = "";
  let cargada = false;
  let conSesion = false;

  const pedirSesion = async () => {
    const r = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
    const d = await r.json().catch(() => ({}));
    csrf = d.csrfToken || csrf;
    return r.ok && d.authenticated === true;
  };

  // Al cerrar sesión (o si vence) se recarga: la página vuelve a ser solo el inicio de sesión.
  window.addEventListener("vaak:session", (e) => {
    if (e.detail && e.detail.authenticated) conSesion = true;
    else if (conSesion) location.replace("/");
  });

  // Primero los estilos internos (para que las pantallas no aparezcan sin diseño) y luego el código.
  const cargarEstilos = () => new Promise((ok, mal) => {
    if (document.querySelector("link[data-vaak-estilos]")) return ok();
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = ESTILOS;
    l.dataset.vaakEstilos = "1";
    l.onload = ok;
    l.onerror = () => mal(new Error("app_unavailable"));
    document.head.appendChild(l);
  });
  const cargarPlataforma = () => cargarEstilos().then(() => new Promise((ok, mal) => {
    if (cargada) return ok();
    const s = document.createElement("script");
    s.src = APP;
    s.onload = () => { cargada = true; ok(); };
    s.onerror = () => mal(new Error("app_unavailable"));
    document.body.appendChild(s);
  }));

  const mensajes = {
    invalid_credentials: "Incorrect username or password.",
    user_inactive: "This user is deactivated. Ask an administrator to activate it.",
    no_membership: "This user does not have access to the platform.",
    missing_fields: "Enter your username and password.",
    session_expired: "This page was open too long. Reload the page and try again.",
    service_unavailable: "The sign-in service is not responding. Try again in a few minutes.",
    app_unavailable: "You are signed in, but the platform could not be loaded. Reload the page.",
    network: "Cannot reach the server. Check your internet connection and try again.",
  };
  const mensaje = (codigo, segundos) => codigo === "too_many_attempts"
    ? `Too many failed attempts. For security, wait ${Math.max(1, Math.ceil(Number(segundos || 0) / 60))} min before trying again.`
    : mensajes[codigo] || "Could not sign in. Try again.";

  const form = document.getElementById("login");
  const boton = form && form.querySelector(".login-submit");
  const mostrarError = (texto) => {
    form.querySelector(".login-error")?.remove();
    if (!texto) return;
    const caja = document.createElement("div");
    caja.className = "login-error";
    caja.setAttribute("role", "alert");
    caja.textContent = texto;
    form.insertBefore(caja, boton);
  };
  const ocupado = (si) => {
    form.querySelectorAll("input").forEach((i) => { i.readOnly = si; });
    boton.disabled = si;
    boton.classList.toggle("is-loading", si);
    if (si) {
      boton.dataset.html = boton.innerHTML;
      boton.innerHTML = '<span class="login-spinner" aria-hidden="true"></span><span>Signing in...</span>';
    } else if (boton.dataset.html) boton.innerHTML = boton.dataset.html;
  };

  const estilo = document.createElement("style");
  estilo.textContent = ".login-submit.is-loading{opacity:.85;cursor:progress;pointer-events:none}.login-submit .login-spinner{display:inline-block;width:1em;height:1em;margin-right:.55em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:-.15em;animation:vaak-acceso-giro .7s linear infinite}@keyframes vaak-acceso-giro{to{transform:rotate(360deg)}}";
  document.head.appendChild(estilo);

  document.addEventListener("click", (e) => {
    const ojo = e.target.closest("[data-command='eye']");
    if (!ojo || cargada) return;
    const clave = document.getElementById("password");
    const ver = clave.type === "password";
    clave.type = ver ? "text" : "password";
    ojo.setAttribute("aria-label", ver ? "Hide password" : "Show password");
  });

  let enviando = false;
  form?.addEventListener("submit", async (e) => {
    if (cargada) return; // la plataforma ya cargada atiende su propio formulario
    e.preventDefault();
    if (enviando) return;
    enviando = true;
    mostrarError("");
    ocupado(true);
    try {
      if (!csrf) await pedirSesion();
      const r = await fetch("/api/auth/login", {
        method: "POST", credentials: "same-origin",
        headers: { "content-type": "application/json", "x-vaak-csrf": csrf },
        body: JSON.stringify({ username: form.elements.username.value, password: form.elements.password.value }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { mostrarError(mensaje(d.error, d.retryAfterSeconds)); ocupado(false); return; }
      await cargarPlataforma();
    } catch (error) {
      mostrarError(mensaje(error && error.message === "app_unavailable" ? "app_unavailable" : "network"));
      ocupado(false);
    } finally {
      enviando = false;
    }
  });

  // Si ya había una sesión abierta (por ejemplo, al recargar), se entra directo.
  pedirSesion().then((si) => { if (si) return cargarPlataforma(); }).catch(() => {});
})();
