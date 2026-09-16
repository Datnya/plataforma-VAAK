(() => {
  "use strict";
  let csrfToken = "";
  const app = () => window.VAAKAppBridge;
  const request = async (url, options = {}) => {
    const headers = { ...(options.headers || {}) };
    if (csrfToken) headers["x-vaak-csrf"] = csrfToken;
    const response = await fetch(url, { credentials: "same-origin", ...options, headers });
    const data = await response.json().catch(() => ({}));
    csrfToken = data.csrfToken || response.headers.get("x-vaak-csrf") || csrfToken;
    if (!response.ok) throw Object.assign(new Error(data.error || "request_failed"), { status: response.status, code: data.error, retryAfterSeconds: data.retryAfterSeconds });
    return data;
  };
  const session = async () => {
    const response = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    csrfToken = data.csrfToken || csrfToken;
    let applied = false;
    if (response.ok && data.authenticated) applied = app()?.applyRemoteSession(data) === true;
    else app()?.clearRemoteSession();
    return { ...data, applied };
  };

  const spanish = () => String(navigator.language || "").toLowerCase().startsWith("es");
  const minutes = (seconds) => Math.max(1, Math.ceil(Number(seconds || 0) / 60));
  const loginMessage = (code, retryAfterSeconds) => {
    const es = spanish();
    const wait = minutes(retryAfterSeconds);
    const messages = {
      user_not_found: es ? "El usuario no existe. Revisa que el nombre de usuario esté bien escrito." : "That user does not exist. Check the username spelling.",
      invalid_password: es ? "La contraseña es incorrecta." : "The password is incorrect.",
      user_inactive: es ? "Este usuario está desactivado. Pide a un administrador que lo active." : "This user is deactivated. Ask an administrator to activate it.",
      no_membership: es ? "Este usuario no tiene acceso a ninguna empresa en VAAK." : "This user does not have access to any VAAK company.",
      too_many_attempts: es ? "Demasiados intentos fallidos. Por seguridad, espera " + wait + " min antes de volver a intentarlo." : "Too many failed attempts. For security, wait " + wait + " min before trying again.",
      auth_rate_limited: es ? "Se hicieron demasiados intentos seguidos. Espera 1 minuto y vuelve a intentarlo." : "Too many attempts in a row. Wait 1 minute and try again.",
      session_expired: es ? "La página estuvo abierta mucho tiempo. Recarga la página e inténtalo de nuevo." : "This page was open too long. Reload the page and try again.",
      missing_fields: es ? "Escribe tu usuario y tu contraseña." : "Enter your username and password.",
      service_unavailable: es ? "El servicio de inicio de sesión no responde. Inténtalo en unos minutos." : "The sign-in service is not responding. Try again in a few minutes.",
      session_not_started: es ? "La contraseña es correcta, pero no se pudo abrir la sesión. Recarga la página e inténtalo de nuevo." : "The password is correct, but the session could not be opened. Reload the page and try again.",
      sync_failed: es ? "La contraseña es correcta, pero no se pudieron cargar los datos de la plataforma. Recarga la página." : "The password is correct, but the platform data could not be loaded. Reload the page.",
      network: es ? "No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo." : "Cannot reach the server. Check your internet connection and try again.",
    };
    return messages[code] || (es ? "No se pudo iniciar sesión. Inténtalo de nuevo." : "Could not sign in. Try again.");
  };

  if (!document.getElementById("vaak-login-feedback-style")) {
    const style = document.createElement("style");
    style.id = "vaak-login-feedback-style";
    style.textContent = ".login-submit.is-loading{opacity:.85;cursor:progress;pointer-events:none}.login-submit .login-spinner{display:inline-block;width:1em;height:1em;margin-right:.55em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:-0.15em;animation:vaak-login-spin .7s linear infinite}@keyframes vaak-login-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.login-submit .login-spinner{animation-duration:2s}}";
    document.head.appendChild(style);
  }

  let loginPending = false;
  const setLoginLoading = (form, loading) => {
    const button = form.querySelector(".login-submit, button:not([type='button'])");
    form.querySelectorAll("input").forEach((input) => { input.readOnly = loading; });
    if (!button) return;
    if (loading) {
      button.dataset.originalHtml = button.innerHTML;
      button.disabled = true;
      button.classList.add("is-loading");
      button.setAttribute("aria-busy", "true");
      button.innerHTML = '<span class="login-spinner" aria-hidden="true"></span><span>' + (spanish() ? "Ingresando..." : "Signing in...") + "</span>";
    } else {
      button.disabled = false;
      button.classList.remove("is-loading");
      button.removeAttribute("aria-busy");
      if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
    }
  };
  const showLoginError = (form, text) => {
    form.querySelector(".login-error")?.remove();
    if (!text || !form.isConnected) { if (text) app()?.showMessage(text); return; }
    const box = document.createElement("div");
    box.className = "login-error";
    box.setAttribute("role", "alert");
    box.textContent = text;
    const button = form.querySelector(".login-submit, button:not([type='button'])");
    form.insertBefore(box, button || null);
  };
  const handleLogin = async (form) => {
    if (loginPending) return;
    loginPending = true;
    showLoginError(form, "");
    setLoginLoading(form, true);
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      if (!csrfToken) await session();
      await request("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const current = await session();
      if (!current.authenticated) showLoginError(form, loginMessage("session_not_started"));
      else if (!current.applied) showLoginError(form, loginMessage("sync_failed"));
    } catch (error) {
      const code = error?.status ? error.code : "network";
      showLoginError(form, loginMessage(code, error?.retryAfterSeconds));
    } finally {
      loginPending = false;
      if (form.isConnected) setLoginLoading(form, false);
    }
  };
  const directory = async () => {
    const [users, current] = await Promise.all([request("/api/admin/users"), request("/api/auth/session")]);
    app()?.completeRemoteUserMutation({ users: users.users, user: current.user });
  };
  const formPayload = (form, operation) => {
    const values = Object.fromEntries(new FormData(form).entries());
    const draft = operation.draft || {};
    const phone = [values.phoneCountryCode, values.phone].filter(Boolean).join(" ").trim();
    return {
      legacyId: operation.target?.id,
      name: values.name || operation.target?.name,
      email: values.email || operation.target?.email,
      username: values.username || operation.target?.username,
      password: values.password || undefined,
      role: draft.role || operation.target?.role,
      team: values.team || "",
      position: values.position || "",
      phone,
      access: { version: 2, grants: draft.grants || operation.target?.access?.grants || {} },
      projectScope: draft.projectMode || operation.target?.projectScope || "selected",
      projectIds: (draft.role || operation.target?.role) === "Client" ? (draft.clientProjectIds || operation.target?.projectIds || []) : (draft.projectIds || operation.target?.projectIds || []),
    };
  };

  document.addEventListener("submit", async (event) => {
    if (event.target.id === "login") {
      event.preventDefault(); event.stopImmediatePropagation();
      await handleLogin(event.target);
      return;
    }
    if (event.target.id !== "authorized-form") return;
    const operation = app()?.getActiveOperation();
    if (!operation || !["user-editor", "confirm-toggle", "confirm-delete-user"].includes(operation.kind)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    try {
      if (operation.kind === "user-editor") {
        const payload = formPayload(event.target, operation);
        if (operation.mode === "new") {
          await request("/api/admin/users", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify(payload) });
        } else {
          await request(`/api/admin/users/${encodeURIComponent(operation.target.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
        }
      } else if (operation.kind === "confirm-toggle") {
        await request(`/api/admin/users/${encodeURIComponent(operation.target.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ active: !operation.target.active }) });
      } else {
        await request(`/api/admin/users/${encodeURIComponent(operation.target.id)}`, { method: "DELETE" });
      }
      await directory();
    } catch (error) {
      app()?.showMessage(error.code === "identity_exists" ? "That username or email is already registered." : "The user could not be saved.");
    }
  }, true);

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-command='logout']");
    if (!button) return;
    event.preventDefault(); event.stopImmediatePropagation();
    try { await request("/api/auth/logout", { method: "POST" }); } finally { app()?.clearRemoteSession(); }
  }, true);

  session().catch(() => app()?.clearRemoteSession());
})();
