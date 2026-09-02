(() => {
  async function syncSession() {
    try {
      const response = await fetch("/api/auth/session", { credentials: "same-origin" });
      if (!response.ok) throw new Error("No active session");
      const session = await response.json();
      const account = data.users.find((candidate) => candidate.username === session.username && candidate.active);
      if (!account) throw new Error("Account unavailable");
      user = account;
      localStorage.setItem(SESSION, account.id);
    } catch {
      user = null;
      localStorage.removeItem(SESSION);
    }
    render();
  }

  document.addEventListener("submit", async (event) => {
    if (event.target.id !== "login") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const form = event.target;
    const button = form.querySelector("button[type='submit'], button.primary");
    if (button) button.disabled = true;
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: new FormData(form),
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      const account = data.users.find((candidate) => candidate.username === result.username && candidate.active);
      if (!response.ok || !account) throw new Error("Invalid credentials");
      user = account;
      localStorage.setItem(SESSION, account.id);
      render();
    } catch {
      msg("Usuario o contraseña incorrectos.");
    } finally {
      if (button) button.disabled = false;
    }
  }, true);

  document.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-action='logout']");
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    localStorage.removeItem(SESSION);
    user = null;
    render();
  }, true);

  syncSession();
})();
