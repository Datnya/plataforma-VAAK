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
    style.textContent = ".login-submit.is-loading,.vaak-busy{opacity:.85;cursor:progress!important;pointer-events:none}.vaak-busy{transform:none!important}.vaak-busy-label{display:inline-flex;align-items:center;justify-content:center}.login-submit .login-spinner,.vaak-busy .login-spinner{display:inline-block;width:1em;height:1em;margin-right:.55em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:-0.15em;animation:vaak-login-spin .7s linear infinite}@keyframes vaak-login-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.login-submit .login-spinner,.vaak-busy .login-spinner{animation-duration:2s}}.modal-foot.vaak-has-error{flex-wrap:wrap}.vaak-form-error{flex:1 1 240px;margin:0 auto 0 0;padding:.6rem .9rem;border:1px solid #e74c3c;border-radius:8px;background:#fdf0ef;color:#c0392b;font-size:.82rem;font-weight:600;line-height:1.4}.vaak-role-hint{display:block;margin-top:.3rem;color:#7a6a5f;font-size:.74rem}.vaak-confirm-backdrop{position:fixed;inset:0;z-index:1300;display:grid;place-items:center;padding:1rem;background:rgba(39,27,21,.55)}.vaak-confirm{width:min(480px,100%);max-height:90vh;overflow:auto;border-radius:14px;background:#fff;box-shadow:0 24px 60px rgba(39,27,21,.35)}.vaak-confirm-head{display:flex;align-items:center;gap:.7rem;padding:1.1rem 1.3rem .4rem}.vaak-confirm-icon{display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;border-radius:50%;background:#f6ead3;color:#876312;font-weight:800;font-size:1.1rem}.vaak-confirm-head h3{margin:0;font-size:1.15rem;color:#35251d}.vaak-confirm-body{padding:.4rem 1.3rem 1rem;color:#4f4038;font-size:.9rem;line-height:1.55}.vaak-confirm-body p{margin:.45rem 0}.vaak-confirm-body ul{margin:.45rem 0 .2rem;padding-left:1.15rem}.vaak-confirm-foot{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.6rem;padding:.9rem 1.3rem 1.2rem;border-top:1px solid #eee4da}";
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

  /* Role change for existing users (edit form), with an explicit confirmation step. */
  const currentUserId = () => { try { return sessionStorage.getItem("vaak-session-tab-v1"); } catch { return null; } };
  const roleName = (role, es) => ({ Admin: es ? "Administrador" : "Administrator", Worker: es ? "Trabajador" : "Worker", Client: es ? "Cliente" : "Client" })[role] || role;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const enhanceRoleField = () => {
    const form = document.getElementById("authorized-form");
    if (!form || form.dataset.vaakRoleReady) return;
    const operation = app()?.getActiveOperation();
    const target = operation?.target;
    if (!operation || operation.kind !== "user-editor" || operation.mode !== "edit" || operation.accessOnly || !target) return;
    form.dataset.vaakRoleReady = "1";
    if (!["Worker", "Admin", "Client"].includes(target.role) || target.id === currentUserId()) return;
    const anchor = form.querySelector("[name='username']")?.closest(".field");
    if (!anchor) return;
    const es = appSpanish();
    const roles = [...new Set([target.role, "Worker", "Admin"])];
    const field = document.createElement("div");
    field.className = "field vaak-role-field";
    field.setAttribute("translate", "no");
    field.innerHTML = "<label>" + (es ? "Rol del usuario" : "User role") + "</label><select data-role-select data-vaak-role-edit data-current-role='" + target.role + "'>" + roles.map((role) => "<option value='" + role + "'" + (role === target.role ? " selected" : "") + ">" + roleName(role, es) + "</option>").join("") + "</select><small class='vaak-role-hint'>" + (es ? "El cambio de rol se aplica al hacer clic en Guardar cambios." : "The role change is applied when you click Save changes.") + "</small>";
    anchor.after(field);
  };
  const confirmRoleChange = ({ name, from, to }) => new Promise((resolve) => {
    const es = appSpanish();
    const who = "<strong>" + escapeHtml(name) + "</strong>";
    let title, paragraphs, confirmLabel;
    if (to === "Admin") {
      title = es ? "Asignar rol de Administrador" : "Grant Administrator role";
      paragraphs = es
        ? ["Estás a punto de asignar el rol de <strong>Administrador</strong> a " + who + ".", "Con este rol tendrá acceso completo a todas las secciones del sistema, incluidas:", "<ul><li>Gestión de usuarios, roles y permisos</li><li>Gestión de proveedores y órdenes de compra</li><li>Configuración del sistema</li></ul>", "¿Deseas confirmar este cambio?"]
        : ["You are about to grant the <strong>Administrator</strong> role to " + who + ".", "With this role they will have full access to every section of the system, including:", "<ul><li>User, role and permission management</li><li>Supplier and purchase order management</li><li>System settings</li></ul>", "Do you want to confirm this change?"];
      confirmLabel = es ? "Sí, asignar rol" : "Yes, grant role";
    } else if (from === "Admin") {
      title = es ? "Retirar rol de Administrador" : "Remove Administrator role";
      paragraphs = es
        ? [who + " dejará de ser Administrador y pasará a tener el rol de <strong>" + roleName(to, es) + "</strong>.", "Perderá el acceso completo al sistema y solo podrá ver las secciones que habilites en este formulario.", "¿Deseas confirmar este cambio?"]
        : [who + " will no longer be an Administrator and will have the <strong>" + roleName(to, es) + "</strong> role.", "They will lose full system access and will only see the sections you enable in this form.", "Do you want to confirm this change?"];
      confirmLabel = es ? "Sí, cambiar rol" : "Yes, change role";
    } else {
      title = es ? "Cambiar rol del usuario" : "Change user role";
      paragraphs = es
        ? ["El rol de " + who + " cambiará de <strong>" + roleName(from, es) + "</strong> a <strong>" + roleName(to, es) + "</strong>.", "Sus accesos se reiniciarán y deberás revisarlos antes de guardar.", "¿Deseas confirmar este cambio?"]
        : [who + "'s role will change from <strong>" + roleName(from, es) + "</strong> to <strong>" + roleName(to, es) + "</strong>.", "Their access will be reset and you should review it before saving.", "Do you want to confirm this change?"];
      confirmLabel = es ? "Sí, cambiar rol" : "Yes, change role";
    }
    const backdrop = document.createElement("div");
    backdrop.className = "vaak-confirm-backdrop";
    backdrop.setAttribute("translate", "no");
    backdrop.innerHTML = "<div class='vaak-confirm' role='alertdialog' aria-modal='true' aria-labelledby='vaak-confirm-title'><div class='vaak-confirm-head'><span class='vaak-confirm-icon' aria-hidden='true'>!</span><h3 id='vaak-confirm-title'>" + title + "</h3></div><div class='vaak-confirm-body'>" + paragraphs.map((text) => text.startsWith("<ul>") ? text : "<p>" + text + "</p>").join("") + "</div><div class='vaak-confirm-foot'><button type='button' class='secondary' data-vaak-confirm='cancel'>" + (es ? "Cancelar" : "Cancel") + "</button><button type='button' class='primary' data-vaak-confirm='ok'>" + confirmLabel + "</button></div></div>";
    const close = (result) => { document.removeEventListener("keydown", onKey, true); backdrop.remove(); resolve(result); };
    const onKey = (event) => { if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); close(false); } };
    backdrop.addEventListener("click", (event) => {
      const choice = event.target.closest("[data-vaak-confirm]")?.dataset.vaakConfirm;
      if (choice) close(choice === "ok");
      else if (event.target === backdrop) close(false);
    });
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(backdrop);
    backdrop.querySelector("[data-vaak-confirm='cancel']").focus();
  });
  document.addEventListener("change", async (event) => {
    const select = event.target.closest?.("[data-vaak-role-edit]");
    if (!select) return;
    if (select.dataset.vaakRoleConfirmed) { delete select.dataset.vaakRoleConfirmed; select.dataset.currentRole = select.value; return; }
    event.stopImmediatePropagation();
    const from = select.dataset.currentRole;
    const to = select.value;
    select.value = from;
    if (to === from) return;
    const name = app()?.getActiveOperation()?.target?.name || "";
    const confirmed = await confirmRoleChange({ name, from, to });
    if (!confirmed || !select.isConnected) return;
    select.value = to;
    select.dataset.vaakRoleConfirmed = "1";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }, true);
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) new MutationObserver(enhanceRoleField).observe(modalRoot, { childList: true, subtree: true });
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
