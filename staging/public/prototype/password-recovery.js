(() => {
  "use strict";
  if (!window.location.hash.includes("type=recovery")) return;

  const supabase = window.VAAK_SUPABASE;
  if (!supabase) return;

  function render() {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(15,15,15,0.72);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:inherit;";
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:32px;max-width:360px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
        <h2 style="margin:0 0 6px;font-size:20px;">Elige tu nueva contraseña</h2>
        <p style="margin:0 0 18px;color:#555;font-size:14px;">Escribe una contraseña nueva para tu cuenta VAAK.</p>
        <form id="vaak-recovery-form">
          <label style="display:block;margin-bottom:12px;font-size:13px;color:#333;">Nueva contraseña
            <input name="password" type="password" minlength="8" required autocomplete="new-password"
              style="display:block;width:100%;margin-top:4px;padding:10px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box;">
          </label>
          <label style="display:block;margin-bottom:12px;font-size:13px;color:#333;">Confirmar contraseña
            <input name="confirm" type="password" minlength="8" required autocomplete="new-password"
              style="display:block;width:100%;margin-top:4px;padding:10px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box;">
          </label>
          <p id="vaak-recovery-error" style="color:#b42318;font-size:13px;min-height:18px;margin:0 0 10px;"></p>
          <button type="submit" style="width:100%;padding:12px;background:#b8912f;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;">
            Guardar contraseña
          </button>
        </form>
      </div>`;
    document.body.appendChild(overlay);

    const form = overlay.querySelector("#vaak-recovery-form");
    const errorEl = overlay.querySelector("#vaak-recovery-error");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorEl.textContent = "";
      const values = Object.fromEntries(new FormData(form).entries());
      if (values.password.length < 8) {
        errorEl.textContent = "La contraseña debe tener al menos 8 caracteres.";
        return;
      }
      if (values.password !== values.confirm) {
        errorEl.textContent = "Las contraseñas no coinciden.";
        return;
      }
      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      submitBtn.textContent = "Guardando...";
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) {
        errorEl.textContent = "No se pudo actualizar la contraseña. El enlace puede haber expirado — solicita uno nuevo desde Supabase.";
        submitBtn.disabled = false;
        submitBtn.textContent = "Guardar contraseña";
        return;
      }
      await supabase.auth.signOut();
      overlay.querySelector("div").innerHTML = "<p style='margin:0;font-size:15px;'>Tu contraseña se actualizó correctamente. Ya puedes cerrar esta ventana e ingresar con tu usuario y tu nueva contraseña.</p>";
      window.history.replaceState(null, "", window.location.pathname);
    });
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") render();
  });
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) render();
  });
})();
