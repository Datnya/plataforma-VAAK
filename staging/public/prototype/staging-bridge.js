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
    style.textContent = ".login-submit.is-loading,.vaak-busy{opacity:.85;cursor:progress!important;pointer-events:none}.vaak-busy{transform:none!important}.vaak-busy-label{display:inline-flex;align-items:center;justify-content:center}.login-submit .login-spinner,.vaak-busy .login-spinner{display:inline-block;width:1em;height:1em;margin-right:.55em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:-0.15em;animation:vaak-login-spin .7s linear infinite}@keyframes vaak-login-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.login-submit .login-spinner,.vaak-busy .login-spinner{animation-duration:2s}}.modal-foot.vaak-has-error{flex-wrap:wrap}.vaak-form-error{flex:1 1 240px;margin:0 auto 0 0;padding:.6rem .9rem;border:1px solid #e74c3c;border-radius:8px;background:#fdf0ef;color:#c0392b;font-size:.82rem;font-weight:600;line-height:1.4}";
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
      button.innerHTML = '<span class="login-spinner" aria-hidden="true"></span><span translate="no">' + (spanish() ? "Ingresando..." : "Signing in...") + "</span>";
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
    box.setAttribute("translate", "no");
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
  const appSpanish = () => {
    try {
      const id = sessionStorage.getItem("vaak-session-tab-v1");
      return localStorage.getItem("vaak-language-" + (id || "guest")) === "es";
    } catch { return false; }
  };
  const userSaveMessage = (error, operation) => {
    const es = appSpanish();
    const deleting = operation.kind === "confirm-delete-user";
    const messages = {
      identity_exists: es ? "Ese nombre de usuario o correo ya está registrado." : "That username or email is already registered.",
      identity_conflict: es ? "Ese nombre de usuario o correo ya lo usa otra persona." : "That username or email is already used by someone else.",
      invalid_request: es ? "Revisa los datos: todos los campos son obligatorios, el correo debe ser válido y la contraseña debe tener al menos 8 caracteres." : "Check the details: all fields are required, the email must be valid and the password needs at least 8 characters.",
      auth_update_failed: es ? "No se pudo actualizar el acceso. Usa una contraseña de al menos 8 caracteres y un correo válido." : "Access could not be updated. Use a password with at least 8 characters and a valid email.",
      cannot_disable_self: es ? "No puedes desactivar tu propia cuenta." : "You cannot deactivate your own account.",
      cannot_delete_self: es ? "No puedes eliminar tu propia cuenta." : "You cannot delete your own account.",
      last_active_admin: es ? "Debe quedar al menos un administrador activo." : "At least one active administrator must remain.",
      not_found: es ? "Este usuario no existe en la base de datos (puede ser un perfil antiguo de prueba). Recarga la página." : "This user does not exist in the database (it may be an old demo profile). Reload the page.",
      forbidden: es ? "Tu sesión expiró o no tienes permiso. Recarga la página e inicia sesión de nuevo." : "Your session expired or you lack permission. Reload the page and sign in again.",
      network: es ? "No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo." : "Cannot reach the server. Check your internet connection and try again.",
      refresh_failed: es ? "Los cambios se guardaron, pero no se pudo actualizar la lista. Recarga la página." : "Changes were saved, but the list could not be refreshed. Reload the page.",
    };
    const code = error?.refreshFailed ? "refresh_failed" : !error?.status ? "network" : messages[error.code] ? error.code : error.status === 404 ? "not_found" : error.status === 403 ? "forbidden" : "";
    return messages[code] || (deleting ? (es ? "No se pudo eliminar el usuario. Inténtalo de nuevo." : "The user could not be deleted. Try again.") : (es ? "No se pudieron guardar los cambios. Inténtalo de nuevo." : "The changes could not be saved. Try again."));
  };
  const setButtonBusy = (button, busy, label) => {
    if (!button) return;
    if (busy) {
      button.dataset.busyHtml = button.innerHTML;
      button.dataset.busyWasDisabled = button.disabled ? "1" : "";
      button.disabled = true;
      button.classList.add("vaak-busy");
      button.setAttribute("aria-busy", "true");
      button.innerHTML = '<span class="vaak-busy-label" translate="no"><span class="login-spinner" aria-hidden="true"></span>' + label + "</span>";
    } else {
      button.classList.remove("vaak-busy");
      button.removeAttribute("aria-busy");
      if (button.dataset.busyHtml !== undefined) button.innerHTML = button.dataset.busyHtml;
      button.disabled = button.dataset.busyWasDisabled === "1";
      delete button.dataset.busyHtml;
      delete button.dataset.busyWasDisabled;
    }
  };
  const showFormError = (form, text) => {
    form.querySelector(".vaak-form-error")?.remove();
    form.querySelector(".modal-foot")?.classList.remove("vaak-has-error");
    if (!text) return;
    if (!form.isConnected) { app()?.showMessage(text); return; }
    const box = document.createElement("div");
    box.className = "vaak-form-error";
    box.setAttribute("role", "alert");
    box.setAttribute("translate", "no");
    box.textContent = text;
    const footer = form.querySelector(".modal-foot");
    if (footer) { footer.classList.add("vaak-has-error"); footer.prepend(box); } else form.appendChild(box);
    box.scrollIntoView({ block: "nearest" });
  };
  let userMutationPending = false;
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
    if (userMutationPending) return;
    userMutationPending = true;
    const form = event.target;
    const es = appSpanish();
    const submitButton = event.submitter || form.querySelector(".modal-foot button:not([type='button'])");
    const busyLabel = operation.kind === "confirm-delete-user" ? (es ? "Eliminando..." : "Deleting...") : operation.kind === "confirm-toggle" ? (es ? "Actualizando..." : "Updating...") : operation.mode === "new" ? (es ? "Creando usuario..." : "Creating user...") : (es ? "Guardando..." : "Saving...");
    showFormError(form, "");
    setButtonBusy(submitButton, true, busyLabel);
    form.querySelectorAll(".modal-foot button, .modal-head button").forEach((button) => { if (button !== submitButton) { button.dataset.busyLock = button.disabled ? "1" : ""; button.disabled = true; } });
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
      try { await directory(); } catch (refreshError) { throw Object.assign(refreshError, { refreshFailed: true }); }
    } catch (error) {
      showFormError(form, userSaveMessage(error, operation));
    } finally {
      userMutationPending = false;
      if (form.isConnected) {
        setButtonBusy(submitButton, false);
        form.querySelectorAll(".modal-foot button, .modal-head button").forEach((button) => { if (button.dataset.busyLock !== undefined) { button.disabled = button.dataset.busyLock === "1"; delete button.dataset.busyLock; } });
      }
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
