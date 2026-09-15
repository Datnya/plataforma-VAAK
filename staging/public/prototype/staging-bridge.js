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
    if (!response.ok) throw Object.assign(new Error(data.error || "request_failed"), { status: response.status, code: data.error });
    return data;
  };
  const session = async () => {
    const response = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    csrfToken = data.csrfToken || csrfToken;
    if (response.ok && data.authenticated) app()?.applyRemoteSession(data);
    else app()?.clearRemoteSession();
    return data;
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
      const values = Object.fromEntries(new FormData(event.target).entries());
      try {
        if (!csrfToken) await session();
        await request("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
        await session();
      } catch { app()?.showMessage("The username or password entered is incorrect."); }
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
