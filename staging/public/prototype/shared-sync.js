// Shared company workspace: keeps projects, purchase orders, suppliers, specs, tasks, invoices and
// catalogs in sync between every user of the company (server copy in /api/data).
(() => {
  "use strict";
  const STORE = "vaak-local-v8";
  const META = "vaak-shared-sync-v1";
  const COLLECTIONS = ["projects", "orders", "suppliers", "specs", "tasks", "projectCompanies", "supplierProjectLinks"];
  // Everything else the app keeps in localStorage that must be shared: catalogs, company contact,
  // purchase order drafts and each user's dismissed notifications (an object keyed by user id).
  // The client access log is not here: the server writes it at login (/api/admin/access-log).
  const EXTRAS = ["vaak-custom-oc-rubros", "vaak-custom-rubros", "vaak-removed-spec-rubros", "vaak-removed-oc-rubros", "vaak-company-contact", "vaak-oc-drafts", "vaak-dismissed-notifs"];
  const DISMISSED = "vaak-dismissed-notifs";
  const LINK_KEYS = { projectCompanies: ["projectId", "companyId"], supplierProjectLinks: ["supplierId", "projectId"] };
  const ASSET_MIN = 4096;
  const ASSET_MAX_BYTES = 3000000;
  const PULL_MS = 20000;

  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;
  let suppress = 0;
  let pushTimer = null;
  let session = null;
  let revision = 0;
  let remote = null;
  let base = null;
  let baseLocalRev = -1;
  let pendingApply = false;
  let failures = 0;
  let pulled = false;
  let chain = Promise.resolve();
  const assetCache = new Map();

  // Aviso visible cuando el servidor NO aceptó el guardado (24-sep-2026). Antes fallaba en silencio:
  // el registro quedaba en la pantalla pero nunca llegaba al servidor.
  let avisoFallo = null;
  const textoEs = () => { try { const id = sessionStorage.getItem("vaak-session-tab-v1"); const v = localStorage.getItem("vaak-language-" + (id || "guest")); return v ? v === "es" : document.documentElement.lang === "es"; } catch { return false; } };
  const frase = (es, en) => (textoEs() ? es : en);
  function mostrarFallo(motivo) {
    if (!avisoFallo) {
      avisoFallo = document.createElement("div");
      avisoFallo.className = "vaak-sync-alerta";
      avisoFallo.setAttribute("role", "alert");
      document.body.appendChild(avisoFallo);
      if (!document.getElementById("vaak-sync-estilo")) {
        const estilo = document.createElement("style");
        estilo.id = "vaak-sync-estilo";
        estilo.textContent = ".vaak-sync-alerta{position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);z-index:1400;display:flex;flex-wrap:wrap;align-items:center;gap:.7rem;width:min(660px,calc(100% - 2rem));padding:.85rem 1.1rem;border:1px solid #e7aaa2;border-radius:12px;background:#fdecea;color:#8a1c13;box-shadow:0 10px 30px rgba(39,27,21,.2);font-size:.88rem;font-weight:600}.vaak-sync-alerta p{flex:1 1 280px;margin:0}.vaak-sync-alerta button{white-space:nowrap}";
        document.head.appendChild(estilo);
      }
    }
    avisoFallo.innerHTML = "<p>" + motivo + "</p><button type=\"button\" class=\"secondary\" data-sync-retry>" + frase("Reintentar ahora", "Retry now") + "</button>";
    avisoFallo.querySelector("[data-sync-retry]").addEventListener("click", () => { avisoFallo.querySelector("[data-sync-retry]").disabled = true; run(() => push()); });
  }
  const ocultarFallo = () => { avisoFallo?.remove(); avisoFallo = null; };
  const motivoDeFallo = (error) => {
    if (error?.status === 413) return frase(
      "No se pudo guardar: la información del proyecto superó el tamaño que admite el servidor. Avisa al soporte antes de seguir cargando; lo último que hiciste está solo en este navegador.",
      "Could not save: the project data went over the size the server accepts. Contact support before adding more; your latest changes are only in this browser.");
    if (error?.status === 401 || error?.status === 403) return frase(
      "No se pudo guardar: tu sesión terminó. Vuelve a iniciar sesión para que se guarden tus cambios.",
      "Could not save: your session ended. Sign in again so your changes are saved.");
    return frase(
      "No se pudo guardar en el servidor. Tus cambios están solo en este navegador; se reintentará solo.",
      "Could not save to the server. Your changes are only in this browser; it will retry on its own.");
  };

  // El documento viaja comprimido cuando el navegador y el servidor pueden (unas diez veces menos).
  let puedeComprimir = typeof CompressionStream === "function";
  async function comprimir(texto) {
    const flujo = new Blob([texto]).stream().pipeThrough(new CompressionStream("gzip"));
    const bytes = new Uint8Array(await new Response(flujo).arrayBuffer());
    let binario = "";
    for (let i = 0; i < bytes.length; i += 8192) binario += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    return btoa(binario);
  }

  const isOurKey = (key) => key === STORE || EXTRAS.includes(key);
  Storage.prototype.setItem = function (key, value) {
    nativeSet.call(this, key, value);
    if (!suppress && this === window.localStorage && isOurKey(key)) schedulePush();
  };
  Storage.prototype.removeItem = function (key) {
    nativeRemove.call(this, key);
    if (!suppress && this === window.localStorage && isOurKey(key)) schedulePush();
  };
  const quietly = (fn) => { suppress++; try { return fn(); } finally { suppress--; } };

  const signedIn = () => Boolean(session && session.authenticated && session.user);
  const role = () => session?.user?.role || "";
  const canWrite = () => signedIn() && role() !== "Client";
  const run = (task) => { chain = chain.then(task).catch((error) => console.warn("[VAAK sync]", error)); return chain; };
  const request = (url, options) => window.VAAKRemote.request(url, options);
  // Key order is not preserved by the database, so documents are compared in a canonical form.
  const sortKeys = (_key, value) => (value && typeof value === "object" && !Array.isArray(value)
    ? Object.keys(value).sort().reduce((out, key) => { out[key] = value[key]; return out; }, {})
    : value);
  const same = (a, b) => a === b || JSON.stringify(a, sortKeys) === JSON.stringify(b, sortKeys);

  // ---- persisted sync base (survives reloads so unsent local edits are merged, not lost) ----
  const loadMeta = () => {
    try {
      const meta = JSON.parse(localStorage.getItem(META) || "null");
      if (meta && meta.base && meta.base.store) { base = meta.base; baseLocalRev = Number(meta.localRev || 0); }
    } catch { base = null; }
  };
  const saveMeta = (localRev) => {
    baseLocalRev = localRev;
    try { nativeSet.call(localStorage, META, JSON.stringify({ base, localRev })); } catch { /* quota: base stays in memory */ }
  };

  // ---- local document ----
  const readLocal = () => {
    let state;
    try { state = JSON.parse(localStorage.getItem(STORE) || "null"); } catch { return null; }
    if (!state || !Array.isArray(state.projects)) return null;
    const store = {};
    COLLECTIONS.forEach((name) => { store[name] = Array.isArray(state[name]) ? state[name] : []; });
    const extras = {};
    EXTRAS.forEach((key) => { extras[key] = localStorage.getItem(key); });
    return { state, doc: { version: 1, store, extras }, localRev: Number(state.meta?.storeRevision || 0) };
  };

  // ---- images: large data URLs are uploaded once and referenced by URL ----
  const collectDataUrls = (value, out) => {
    if (typeof value === "string") { if (value.length > ASSET_MIN && value.startsWith("data:image/")) out.add(value); }
    else if (Array.isArray(value)) value.forEach((item) => collectDataUrls(item, out));
    else if (value && typeof value === "object") Object.values(value).forEach((item) => collectDataUrls(item, out));
    return out;
  };
  const replaceStrings = (value, map) => {
    if (typeof value === "string") return map.get(value) || value;
    if (Array.isArray(value)) return value.map((item) => replaceStrings(item, map));
    if (value && typeof value === "object") { const out = {}; Object.keys(value).forEach((key) => { out[key] = replaceStrings(value[key], map); }); return out; }
    return value;
  };
  const bytesOf = (dataUrl) => {
    const binary = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };
  const shrink = (dataUrl, maxSide, quality) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => resolve(null);
    image.src = dataUrl;
  });
  const uploadAsset = async (original) => {
    if (assetCache.has(original)) return assetCache.get(original);
    let dataUrl = original;
    const mime = dataUrl.slice(5, dataUrl.indexOf(";"));
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(mime)) dataUrl = await shrink(dataUrl, 2400, 0.86);
    if (dataUrl && dataUrl.length * 0.75 > ASSET_MAX_BYTES) dataUrl = await shrink(dataUrl, 2400, 0.85);
    if (dataUrl && dataUrl.length * 0.75 > ASSET_MAX_BYTES) dataUrl = await shrink(dataUrl, 1600, 0.8);
    if (!dataUrl) return null;
    const digest = await crypto.subtle.digest("SHA-256", bytesOf(dataUrl));
    const id = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    await request("/api/data/assets", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, dataUrl }) });
    const url = "/api/data/assets/" + id;
    assetCache.set(original, url);
    return url;
  };
  const externalize = async (doc) => {
    const found = [...collectDataUrls(doc.store, new Set())];
    if (!found.length) return doc;
    const map = new Map();
    for (const dataUrl of found) { const url = await uploadAsset(dataUrl); if (url) map.set(dataUrl, url); }
    return { ...doc, store: replaceStrings(doc.store, map) };
  };

  // ---- three-way merge (local edits win only where both sides changed the same thing) ----
  const plain = (value) => value && typeof value === "object" && !Array.isArray(value);
  const keyed = (list, keyOf) => {
    if (!Array.isArray(list)) return null;
    const map = new Map();
    for (const item of list) { const key = keyOf(item); if (key == null || map.has(key)) return null; map.set(key, item); }
    return map;
  };
  const idOf = (item) => (plain(item) && (typeof item.id === "string" || typeof item.id === "number") ? String(item.id) : null);
  function mergeList(b, l, r, keyOf) {
    const bm = keyed(b || [], keyOf), lm = keyed(l, keyOf), rm = keyed(r, keyOf);
    if (!bm || !lm || !rm) return l;
    const out = [];
    const take = (key) => {
      const value = merge(bm.get(key), lm.get(key), rm.get(key));
      if (value !== undefined) out.push(value);
    };
    const seen = new Set();
    r.forEach((item) => { const key = keyOf(item); seen.add(key); take(key); });
    l.forEach((item) => { const key = keyOf(item); if (!seen.has(key)) { seen.add(key); take(key); } });
    return out;
  }
  function merge(b, l, r) {
    if (same(l, b)) return r;
    if (same(r, b) || same(l, r)) return l;
    if (l === undefined) return r;
    if (r === undefined) return l;
    if (plain(b) && plain(l) && plain(r)) {
      const out = {};
      new Set([...Object.keys(r), ...Object.keys(l)]).forEach((key) => {
        const value = merge(b[key], l[key], r[key]);
        if (value !== undefined) out[key] = value;
      });
      return out;
    }
    if (Array.isArray(b) && Array.isArray(l) && Array.isArray(r) && [...b, ...l, ...r].every((item) => idOf(item) !== null)) {
      return mergeList(b, l, r, idOf);
    }
    return l;
  }
  function mergeDocs(b, l, r) {
    const store = {};
    COLLECTIONS.forEach((name) => {
      const keys = LINK_KEYS[name];
      const keyOf = keys ? (item) => (plain(item) ? keys.map((k) => item[k]).join("|") : null) : idOf;
      const lb = b.store[name] || [], ll = l.store[name] || [], lr = r.store[name] || [];
      store[name] = same(ll, lb) ? lr : same(lr, lb) ? ll : mergeList(lb, ll, lr, keyOf);
    });
    const extras = {};
    EXTRAS.forEach((key) => {
      const bv = b.extras?.[key] ?? null, lv = l.extras?.[key] ?? null, rv = r.extras?.[key] ?? null;
      extras[key] = mergeExtra(bv, lv, rv);
    });
    return { version: 1, store, extras };
  }
  // Extras are JSON strings. Lists (drafts, rubros) and per-user objects are merged item by item,
  // so two people saving a draft or a rubro at the same time keep both.
  const parse = (text) => { try { return text == null ? undefined : JSON.parse(text); } catch { return undefined; } };
  const extraKey = (item) => {
    if (typeof item === "string" || typeof item === "number") return "v:" + item;
    if (!plain(item)) return null;
    const key = item.draftId ?? item.id ?? item.code;
    return key == null ? null : "k:" + String(key);
  };
  function mergeExtra(bv, lv, rv) {
    if (lv === bv) return rv;
    if (rv === bv || lv === rv) return lv;
    const b = parse(bv), l = parse(lv), r = parse(rv);
    if (Array.isArray(l) && Array.isArray(r) && (b === undefined || Array.isArray(b))) {
      const merged = mergeList(b || [], l, r, extraKey);
      return merged === l ? lv : JSON.stringify(merged);
    }
    if (plain(l) && plain(r) && (b === undefined || plain(b))) return JSON.stringify(merge(b || {}, l, r));
    return lv;
  }

  // ---- write a shared document into this browser ----
  const busy = () => {
    const modal = document.getElementById("modal-root");
    if (modal && modal.children.length) return true;
    const active = document.activeElement;
    const app = document.getElementById("app");
    return Boolean(active && app && app.contains(active) && (active.matches("input,textarea,select") || active.isContentEditable));
  };
  function writeDoc(doc) {
    const local = readLocal();
    if (!local) return false;
    const state = local.state;
    COLLECTIONS.forEach((name) => { state[name] = Array.isArray(doc.store[name]) ? JSON.parse(JSON.stringify(doc.store[name])) : []; });
    const users = new Set((state.users || []).map((user) => user.id));
    const projects = new Set(state.projects.map((project) => project.id));
    const suppliers = new Set(state.suppliers.map((supplier) => supplier.id));
    const unique = (list, keyOf) => { const seen = new Set(); return list.filter((item) => { const key = keyOf(item); if (seen.has(key)) return false; seen.add(key); return true; }); };
    const byId = (list) => unique(list.filter((item) => item && item.id != null), (item) => String(item.id));
    state.projects = byId(state.projects);
    state.suppliers = byId(state.suppliers);
    state.orders = byId(state.orders).filter((order) => projects.has(order.projectId));
    state.specs = byId(state.specs).filter((spec) => projects.has(spec.projectId));
    const orders = new Set(state.orders.map((order) => order.id));
    const fallback = session?.user?.id && users.has(session.user.id) ? session.user.id : (state.users || []).find((user) => user.role === "Admin" && user.active)?.id;
    state.tasks = byId(state.tasks).map((task) => {
      let assignees = [...new Set((Array.isArray(task.assignees) && task.assignees.length ? task.assignees : [task.assignee]).filter((id) => users.has(id)))];
      if (!assignees.length && fallback) assignees = [fallback];
      return { ...task, assignees, assignee: assignees[0] };
    });
    state.projectCompanies = unique(state.projectCompanies.filter((link) => projects.has(link.projectId) && link.companyId), (link) => link.projectId + "|" + link.companyId);
    state.supplierProjectLinks = unique(state.supplierProjectLinks.filter((link) => suppliers.has(link.supplierId) && projects.has(link.projectId)), (link) => link.supplierId + "|" + link.projectId);
    const companyOf = (projectId) => state.projectCompanies.filter((link) => link.projectId === projectId);
    state.projectMemberships = (state.projectMemberships || []).filter((link) => projects.has(link.projectId));
    state.clientProjectLinks = (state.clientProjectLinks || []).filter((link) => projects.has(link.projectId) && companyOf(link.projectId).length === 1 && companyOf(link.projectId)[0].companyId === link.companyId);
    const clientTuples = new Set(state.clientProjectLinks.map((link) => link.clientId + "|" + link.companyId + "|" + link.projectId));
    state.clientOrderAuthorizations = (state.clientOrderAuthorizations || []).filter((link) => orders.has(link.orderId) && clientTuples.has(link.clientId + "|" + link.companyId + "|" + link.projectId));
    state.meta = { ...(state.meta || {}), storeRevision: Number(state.meta?.storeRevision || 0) + 1 };
    const validation = window.VAAKAccess?.validateState ? window.VAAKAccess.validateState(state) : { ok: true };
    if (!validation.ok) { console.warn("[VAAK sync] shared data rejected", validation.errors); return false; }
    quietly(() => {
      nativeSet.call(localStorage, STORE, JSON.stringify(state));
      if (!doc.partial) EXTRAS.forEach((key) => {
        const value = doc.extras?.[key];
        if (value == null) nativeRemove.call(localStorage, key); else nativeSet.call(localStorage, key, value);
      });
      if (window.VAAKAppBridge?.applyRemoteSession && signedIn()) window.VAAKAppBridge.applyRemoteSession(session);
    });
    return true;
  }

  function applyRemote() {
    if (!remote || !signedIn()) { pendingApply = false; return; }
    if (busy()) { pendingApply = true; return; }
    pendingApply = false;
    const local = readLocal();
    if (!local) return;
    if (base && local.localRev < baseLocalRev) base = null; // store was reset in this browser: take the shared copy
    let target = remote;
    if (base && canWrite()) {
      const localDoc = { ...local.doc, store: replaceStrings(local.doc.store, assetCache) };
      target = mergeDocs(base, localDoc, remote);
    }
    if (!same(target.store, local.doc.store) || (!remote.partial && !same(target.extras, local.doc.extras))) {
      if (!writeDoc(target)) return;
    }
    base = remote;
    saveMeta(readLocal()?.localRev || 0);
    if (canWrite() && !same(target.store, remote.store)) schedulePush(200);
  }

  async function pull(force) {
    if (!signedIn()) return;
    const data = await request("/api/data" + (force || !remote ? "" : "?since=" + revision), { cache: "no-store" });
    pulled = true;
    if (data.unchanged) { if (pendingApply) applyRemote(); return; }
    if (!data.state) {
      revision = 0; remote = null;
      if (role() === "Admin") await push();
      return;
    }
    revision = Number(data.revision);
    remote = data.state;
    applyRemote();
  }

  async function push(attempt = 0) {
    if (!canWrite()) return;
    const local = readLocal();
    if (!local || !pulled) return;
    if (base && local.localRev < baseLocalRev) { base = null; applyRemote(); return; }
    if (revision > 0 && (!remote || !base)) { if (remote) applyRemote(); return; }
    if (revision === 0 && role() !== "Admin") return;
    const localDoc = await externalize(local.doc);
    const outgoing = revision === 0 ? localDoc : mergeDocs(base, localDoc, remote);
    if (remote && same(outgoing, { version: 1, store: remote.store, extras: remote.extras })) {
      if (!same(localDoc.store, local.doc.store) || !same(outgoing.store, localDoc.store)) applyRemote();
      return;
    }
    try {
      const cuerpo = JSON.stringify({ baseRevision: revision, state: outgoing });
      let opciones = { method: "PUT", headers: { "content-type": "application/json" }, body: cuerpo };
      if (puedeComprimir && cuerpo.length > 200000) {
        try { opciones = { method: "PUT", headers: { "content-type": "application/json", "x-vaak-gzip": "1" }, body: await comprimir(cuerpo) }; }
        catch { puedeComprimir = false; }
      }
      let result;
      try { result = await request("/api/data", opciones); }
      catch (error) {
        // Un servidor sin descompresión (415) se atiende sin comprimir y ya no se vuelve a intentar.
        if (error?.status === 415) { puedeComprimir = false; result = await request("/api/data", { method: "PUT", headers: { "content-type": "application/json" }, body: cuerpo }); }
        else throw error;
      }
      ocultarFallo();
      revision = Number(result.revision);
      remote = outgoing;
      // The server keeps only what this user's role may change (workers): it answers with the
      // corrected copy, which replaces the local one so the refused change is not sent again.
      if (result.corrected && result.state && result.state.store) {
        remote = result.state; base = result.state;
        if (writeDoc(remote)) saveMeta(readLocal()?.localRev || 0);
        failures = 0;
        return;
      }
      if (revision === 1 && !base) { base = outgoing; saveMeta(local.localRev); }
      failures = 0;
      applyRemote();
    } catch (error) {
      if (error.status === 409 && attempt < 4) {
        const conflict = error.body || {};
        revision = Number(conflict.revision || 0);
        remote = conflict.state || null;
        if (!base && remote) { applyRemote(); return; }
        return push(attempt + 1);
      }
      failures++;
      mostrarFallo(motivoDeFallo(error));
      setTimeout(() => schedulePush(), Math.min(60000, 5000 * failures));
      throw error;
    }
  }

  function schedulePush(delay = 1200) {
    if (!canWrite()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => run(() => push()), delay);
  }

  // Without a session the browser must not keep the company's data: before this, projects, orders,
  // prices and the user directory stayed in localStorage after signing out, and anyone using the same
  // computer could read them with the browser's developer tools (audit, 21-sep-2026). Everything
  // removed here is downloaded again from the server at the next sign-in.
  function forgetLocalCopy() {
    suppress++;
    try {
      for (const key of [STORE, META, ...EXTRAS]) nativeRemove.call(localStorage, key);
    } catch {} finally { suppress--; }
    base = null; baseLocalRev = -1; pendingApply = false;
  }

  window.addEventListener("vaak:session", (event) => {
    const data = event.detail || null;
    const wasSignedIn = signedIn();
    const previousUser = session?.user?.id;
    session = data && data.authenticated ? data : null;
    if (!signedIn()) { clearTimeout(pushTimer); pulled = false; remote = null; revision = 0; forgetLocalCopy(); return; }
    if (!wasSignedIn || previousUser !== session.user.id) run(() => pull(true));
  });
  setInterval(() => {
    if (!signedIn()) return;
    if (pendingApply && !busy()) run(() => applyRemote());
  }, 1500);
  setInterval(() => { if (signedIn() && !document.hidden) run(() => pull(false)); }, PULL_MS);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && signedIn()) run(() => pull(false)); });
  window.addEventListener("focus", () => { if (signedIn()) run(() => pull(false)); });

  window.addEventListener("storage", (event) => { if (event.key === META) loadMeta(); });
  loadMeta();
  // Dismissed notifications, per user, inside the shared document. Older browsers kept a plain
  // list for whoever was signed in; it is read as the current user's list.
  const currentUserId = () => { try { return sessionStorage.getItem("vaak-session-tab-v1") || session?.user?.id || "guest"; } catch { return session?.user?.id || "guest"; } };
  const dismissedMap = () => {
    const value = parse(localStorage.getItem(DISMISSED));
    if (Array.isArray(value)) return { [currentUserId()]: value };
    return plain(value) ? value : {};
  };
  window.VAAKDismissed = Object.freeze({
    get: () => { const list = dismissedMap()[currentUserId()]; return Array.isArray(list) ? list.slice() : []; },
    set: (list) => { const map = dismissedMap(); map[currentUserId()] = [...new Set(list)]; localStorage.setItem(DISMISSED, JSON.stringify(map)); },
  });
  window.VAAKSharedSync = { pull: () => run(() => pull(true)), push: () => run(() => push()), status: () => ({ revision, pendingApply, hasBase: Boolean(base) }) };
})();
