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
    if (!response.ok) throw Object.assign(new Error(data.error || "request_failed"), { status: response.status, code: data.error, retryAfterSeconds: data.retryAfterSeconds, body: data });
    return data;
  };
  window.VAAKRemote = Object.freeze({ request: (url, options) => request(url, options) });
  let presenceSignedIn = false;
  let lastActivityAt = Date.now();
  let lastHeartbeatAt = 0;
  const sendHeartbeat = async (force) => {
    if (!presenceSignedIn) return;
    const now = Date.now();
    if (!force && (now - lastHeartbeatAt < 60000 || now - lastActivityAt > 60000 || document.hidden)) return;
    lastHeartbeatAt = now;
    try { await request("/api/me/presence", { method: "POST" }); } catch { /* presence is best effort */ }
  };
  ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"].forEach((type) => document.addEventListener(type, () => { lastActivityAt = Date.now(); }, { passive: true, capture: true }));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { lastActivityAt = Date.now(); sendHeartbeat(false); } });
  setInterval(() => sendHeartbeat(false), 15000);
  const session = async () => {
    const response = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    csrfToken = data.csrfToken || csrfToken;
    let applied = false;
    if (response.ok && data.authenticated) applied = app()?.applyRemoteSession(data) === true;
    else app()?.clearRemoteSession();
    const wasSignedIn = presenceSignedIn;
    presenceSignedIn = Boolean(response.ok && data.authenticated);
    if (presenceSignedIn && !wasSignedIn) sendHeartbeat(true);
    window.dispatchEvent(new CustomEvent("vaak:session", { detail: presenceSignedIn && applied ? data : null }));
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
    style.textContent = ".login-submit.is-loading,.vaak-busy{opacity:.85;cursor:progress!important;pointer-events:none}.vaak-busy{transform:none!important}.vaak-busy-label{display:inline-flex;align-items:center;justify-content:center}.login-submit .login-spinner,.vaak-busy .login-spinner{display:inline-block;width:1em;height:1em;margin-right:.55em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:-0.15em;animation:vaak-login-spin .7s linear infinite}@keyframes vaak-login-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.login-submit .login-spinner,.vaak-busy .login-spinner{animation-duration:2s}}.modal-foot.vaak-has-error{flex-wrap:wrap}.vaak-form-error{flex:1 1 240px;margin:0 auto 0 0;padding:.6rem .9rem;border:1px solid #e74c3c;border-radius:8px;background:#fdf0ef;color:#c0392b;font-size:.82rem;font-weight:600;line-height:1.4}.vaak-role-hint{display:block;margin-top:.3rem;color:#7a6a5f;font-size:.74rem}.vaak-confirm-backdrop{position:fixed;inset:0;z-index:1300;display:grid;place-items:center;padding:1rem;background:rgba(39,27,21,.55)}.vaak-confirm{width:min(480px,100%);max-height:90vh;overflow:auto;border-radius:14px;background:#fff;box-shadow:0 24px 60px rgba(39,27,21,.35)}.vaak-confirm-head{display:flex;align-items:center;gap:.7rem;padding:1.1rem 1.3rem .4rem}.vaak-confirm-icon{display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;border-radius:50%;background:#f6ead3;color:#876312;font-weight:800;font-size:1.1rem}.vaak-confirm-head h3{margin:0;font-size:1.15rem;color:#35251d}.vaak-confirm-body{padding:.4rem 1.3rem 1rem;color:#4f4038;font-size:.9rem;line-height:1.55}.vaak-confirm-body p{margin:.45rem 0}.vaak-confirm-body ul{margin:.45rem 0 .2rem;padding-left:1.15rem}.vaak-confirm-foot{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.6rem;padding:.9rem 1.3rem 1.2rem;border-top:1px solid #eee4da}.vaak-confirm-foot .danger{padding:.76rem 1.1rem}.user-identity{position:relative}.vaak-presence{position:relative;display:inline-block;flex:0 0 10px;width:10px;height:10px;margin-right:.55rem;border-radius:50%;background:#9b7a5f;box-shadow:0 0 0 2px #fff,0 0 0 3px #dccbba;cursor:default}.vaak-presence.is-online{background:#22a55b;box-shadow:0 0 0 2px #fff,0 0 0 3px #b9e3c8}.vaak-presence::after{content:attr(data-tip);position:absolute;left:-8px;bottom:calc(100% + 8px);z-index:30;width:max-content;max-width:240px;padding:.35rem .6rem;border-radius:6px;background:#35251d;color:#fff;font-size:.72rem;font-weight:600;line-height:1.3;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s}.vaak-presence:hover::after,.vaak-presence:focus::after{opacity:1}.profile-photo-modal .modal-foot .vaak-photo-remove{margin-right:auto}";
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
  const showConfirm = ({ title, paragraphs, confirmLabel, danger = false }) => new Promise((resolve) => {
    const es = appSpanish();
    const backdrop = document.createElement("div");
    backdrop.className = "vaak-confirm-backdrop";
    backdrop.setAttribute("translate", "no");
    backdrop.innerHTML = "<div class='vaak-confirm' role='alertdialog' aria-modal='true' aria-labelledby='vaak-confirm-title'><div class='vaak-confirm-head'><span class='vaak-confirm-icon' aria-hidden='true'>!</span><h3 id='vaak-confirm-title'>" + title + "</h3></div><div class='vaak-confirm-body'>" + paragraphs.map((text) => text.startsWith("<ul>") ? text : "<p>" + text + "</p>").join("") + "</div><div class='vaak-confirm-foot'><button type='button' class='secondary' data-vaak-confirm='cancel'>" + (es ? "Cancelar" : "Cancel") + "</button><button type='button' class='" + (danger ? "danger" : "primary") + "' data-vaak-confirm='ok'>" + confirmLabel + "</button></div></div>";
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
    showConfirm({ title, paragraphs, confirmLabel }).then(resolve);
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
    presenceSignedIn = false;
    try { await request("/api/auth/logout", { method: "POST" }); } finally { window.dispatchEvent(new CustomEvent("vaak:session", { detail: null })); app()?.clearRemoteSession(); }
  }, true);

  /* Profile photo: stored on the server so it survives sign-out and other devices. */
  const photoMessages = (es) => ({
    saved: es ? "Foto de perfil actualizada." : "Profile photo updated.",
    removed: es ? "Foto de perfil eliminada." : "Profile photo removed.",
    photo_too_large: es ? "La imagen es demasiado pesada. Usa una foto más liviana." : "The image is too large. Use a lighter photo.",
    invalid_photo: es ? "El archivo no es una imagen válida (usa JPG, PNG o WEBP)." : "The file is not a valid image (use JPG, PNG or WEBP).",
    forbidden: es ? "Tu sesión expiró. Recarga la página e inicia sesión de nuevo." : "Your session expired. Reload the page and sign in again.",
    unauthenticated: es ? "Tu sesión expiró. Recarga la página e inicia sesión de nuevo." : "Your session expired. Reload the page and sign in again.",
    network: es ? "No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo." : "Cannot reach the server. Check your internet connection and try again.",
    fallback: es ? "No se pudo guardar la foto. Inténtalo de nuevo." : "The photo could not be saved. Try again.",
  });
  const photoError = (error, es) => { const m = photoMessages(es); return !error?.status ? m.network : m[error.code] || m.fallback; };
  const fileToDataUrl = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  const shrinkImage = (source) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const size = 300, canvas = document.createElement("canvas"), side = Math.min(image.width, image.height);
      canvas.width = size; canvas.height = size;
      canvas.getContext("2d").drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    image.onerror = reject;
    image.src = source;
  });
  const closeActiveModal = (form) => { form.querySelector(".modal-head [data-command='close'], [data-command='close']")?.click(); };
  const refreshAfterProfileChange = async () => { try { await session(); } catch { /* the next page load will refresh */ } };
  let photoPending = false;
  window.addEventListener("submit", async (event) => {
    const form = event.target;
    if (form?.id !== "profile-photo-form") return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (photoPending) return;
    const es = appSpanish();
    const canvas = form.querySelector("#profile-crop-preview");
    const file = form.querySelector("input[name='profilePhoto']")?.files?.[0];
    let photo = "";
    try {
      if (form._cropState && canvas && !canvas.hidden) photo = canvas.toDataURL("image/png");
      else if (file) photo = await shrinkImage(await fileToDataUrl(file));
    } catch { showFormError(form, photoMessages(es).invalid_photo); return; }
    if (!photo) { closeActiveModal(form); return; }
    if (photo.length > 650000) { try { photo = await shrinkImage(photo); } catch { /* keep original */ } }
    photoPending = true;
    const submitButton = event.submitter || form.querySelector(".modal-foot button:not([type='button'])");
    showFormError(form, "");
    setButtonBusy(submitButton, true, es ? "Guardando..." : "Saving...");
    try {
      await request("/api/me/photo", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ photo }) });
      closeActiveModal(form);
      await refreshAfterProfileChange();
      app()?.showMessage(photoMessages(es).saved);
    } catch (error) {
      if (form.isConnected) { setButtonBusy(submitButton, false); showFormError(form, photoError(error, es)); }
    } finally { photoPending = false; }
  }, true);
  const enhancePhotoModal = () => {
    const form = document.getElementById("profile-photo-form");
    if (!form || form.dataset.vaakPhotoReady) return;
    form.dataset.vaakPhotoReady = "1";
    const operation = app()?.getActiveOperation();
    if (!operation?.target?.profilePhoto) return;
    const es = appSpanish();
    const footer = form.querySelector(".modal-foot");
    if (!footer) return;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger vaak-photo-remove";
    remove.setAttribute("translate", "no");
    remove.textContent = es ? "Quitar foto" : "Remove photo";
    footer.prepend(remove);
    remove.addEventListener("click", async () => {
      if (photoPending) return;
      const confirmed = await showConfirm({
        title: es ? "Quitar foto de perfil" : "Remove profile photo",
        paragraphs: es ? ["Tu foto de perfil se eliminará y en su lugar se mostrarán tus iniciales.", "Podrás subir una nueva foto cuando quieras. ¿Deseas continuar?"] : ["Your profile photo will be removed and your initials will be shown instead.", "You can upload a new photo at any time. Do you want to continue?"],
        confirmLabel: es ? "Sí, quitar foto" : "Yes, remove photo",
        danger: true,
      });
      if (!confirmed || !form.isConnected) return;
      photoPending = true;
      showFormError(form, "");
      setButtonBusy(remove, true, es ? "Quitando..." : "Removing...");
      try {
        await request("/api/me/photo", { method: "DELETE" });
        closeActiveModal(form);
        await refreshAfterProfileChange();
        app()?.showMessage(photoMessages(es).removed);
      } catch (error) {
        if (form.isConnected) { setButtonBusy(remove, false); showFormError(form, photoError(error, es)); }
      } finally { photoPending = false; }
    });
  };

  /* Presence: green dot when the user was active in the last 5 minutes, brown otherwise. */
  const ONLINE_WINDOW_MS = 5 * 60 * 1000;
  let presenceData = { map: new Map(), serverNow: 0, fetchedAt: 0 };
  let presenceLoading = false;
  const relativeTime = (ms, es) => {
    const minutes = Math.floor(ms / 60000), hours = Math.floor(minutes / 60), days = Math.floor(hours / 24);
    if (minutes < 1) return es ? "hace un momento" : "just now";
    if (minutes < 60) return es ? "hace " + minutes + " min" : minutes + " min ago";
    if (hours < 24) return es ? "hace " + hours + " h" : hours + " h ago";
    return es ? "hace " + days + (days === 1 ? " día" : " días") : days + (days === 1 ? " day ago" : " days ago");
  };
  const presenceState = (entry) => {
    const es = appSpanish();
    const now = presenceData.serverNow + (Date.now() - presenceData.fetchedAt);
    const seen = entry?.lastSeenAt ? Date.parse(entry.lastSeenAt) : 0;
    const signedOut = entry?.signedOutAt ? Date.parse(entry.signedOutAt) : 0;
    if (!seen) return { online: false, tip: es ? "Sin actividad registrada" : "No recorded activity" };
    const online = now - seen < ONLINE_WINDOW_MS && !(signedOut && signedOut >= seen);
    if (online) return { online: true, tip: es ? "Activo ahora" : "Active now" };
    return { online: false, tip: (signedOut && signedOut >= seen ? (es ? "Sesión cerrada · " : "Signed out · ") : "") + (es ? "Última actividad: " : "Last activity: ") + relativeTime(Math.max(0, now - seen), es) };
  };
  const paintPresence = () => {
    const rows = document.querySelectorAll("tr[data-user-row]");
    if (!rows.length) return;
    rows.forEach((row) => {
      const id = row.querySelector("[data-action='edit-user'][data-id]")?.dataset.id;
      const identity = row.querySelector(".user-identity");
      if (!id || !identity) return;
      let dot = identity.querySelector(".vaak-presence");
      if (!dot) {
        dot = document.createElement("span");
        dot.className = "vaak-presence";
        dot.setAttribute("translate", "no");
        dot.setAttribute("role", "img");
        dot.tabIndex = 0;
        identity.prepend(dot);
      }
      const state = presenceState(presenceData.map.get(id));
      dot.classList.toggle("is-online", state.online);
      if (dot.dataset.tip !== state.tip) { dot.dataset.tip = state.tip; dot.setAttribute("aria-label", state.tip); }
    });
  };
  const loadPresence = async () => {
    if (presenceLoading || !presenceSignedIn || !document.querySelector("tr[data-user-row]")) return;
    presenceLoading = true;
    try {
      const data = await request("/api/admin/presence");
      presenceData = { map: new Map((data.presence || []).map((item) => [item.id, item])), serverNow: Date.parse(data.serverNow) || Date.now(), fetchedAt: Date.now() };
      paintPresence();
    } catch { /* keep the last known state */ } finally { presenceLoading = false; }
  };
  setInterval(() => { paintPresence(); if (!document.hidden) loadPresence(); }, 30000);

  /* Projects: unique codes and an explicit confirmation before changing an existing code. */
  const localProjects = () => { try { return JSON.parse(localStorage.getItem("vaak-local-v8") || "{}").projects || []; } catch { return []; } };
  const codeInUse = (code, exceptId) => localProjects().some((project) => project.id !== exceptId && String(project.code || "").trim().toUpperCase() === code);
  window.addEventListener("submit", async (event) => {
    const form = event.target;
    const es = appSpanish();
    if (form?.id === "authorized-form" && app()?.getActiveOperation()?.kind === "project-editor") {
      const input = form.querySelector("input[name='code']");
      const code = String(input?.value || "").trim().toUpperCase();
      if (input) input.value = code;
      showFormError(form, "");
      if (code && codeInUse(code, null)) {
        event.preventDefault(); event.stopImmediatePropagation();
        showFormError(form, es ? "Ya existe un proyecto con el código " + code + ". Usa un código diferente." : "A project with code " + code + " already exists. Use a different code.");
      }
      return;
    }
    if (form?.id !== "project-card-editor-form") return;
    const input = form.querySelector("input[name='code']");
    if (!input) return;
    const original = String(input.dataset.originalCode || "").trim().toUpperCase();
    const code = String(input.value || "").trim().toUpperCase();
    input.value = code;
    showFormError(form, "");
    if (code && codeInUse(code, form.dataset.projectId)) {
      event.preventDefault(); event.stopImmediatePropagation();
      showFormError(form, es ? "Ya existe otro proyecto con el código " + code + ". Usa un código diferente." : "Another project already uses code " + code + ". Use a different code.");
      return;
    }
    if (!code || code === original) return;
    if (form.dataset.codeChangeConfirmed) { delete form.dataset.codeChangeConfirmed; return; }
    event.preventDefault(); event.stopImmediatePropagation();
    const from = "<strong>" + escapeHtml(original) + "</strong>", to = "<strong>" + escapeHtml(code) + "</strong>";
    const confirmed = await showConfirm({
      title: es ? "Cambiar código del proyecto" : "Change project code",
      paragraphs: es
        ? ["Vas a cambiar el código del proyecto de " + from + " a " + to + ".", "Las órdenes de compra ya emitidas conservarán el código con el que fueron generadas; su numeración y sus documentos no se modificarán.", "A partir de este cambio, las nuevas órdenes de compra se emitirán con el código " + to + ".", "¿Deseas confirmar el cambio?"]
        : ["You are about to change the project code from " + from + " to " + to + ".", "Purchase orders already issued will keep the code they were generated with; their numbering and documents will not change.", "From now on, new purchase orders will be issued with code " + to + ".", "Do you want to confirm this change?"],
      confirmLabel: es ? "Sí, cambiar código" : "Yes, change code",
    });
    if (!confirmed || !form.isConnected) return;
    form.dataset.codeChangeConfirmed = "1";
    form.requestSubmit();
  }, true);

  const appRoot = document.getElementById("app");
  const modalHost = document.getElementById("modal-root");
  let presenceQueued = false;
  if (appRoot) new MutationObserver(() => {
    if (presenceQueued) return;
    presenceQueued = true;
    requestAnimationFrame(() => {
      presenceQueued = false;
      if (!document.querySelector("tr[data-user-row]")) return;
      paintPresence();
      if (Date.now() - presenceData.fetchedAt > 30000) loadPresence();
    });
  }).observe(appRoot, { childList: true, subtree: true });
  if (modalHost) new MutationObserver(enhancePhotoModal).observe(modalHost, { childList: true, subtree: true });

  session().catch(() => app()?.clearRemoteSession());
})();
