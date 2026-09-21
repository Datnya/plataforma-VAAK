// Punto de partida VACÍO para las copias en el hosting (prueba y oficial).
//
// En la interfaz, `staging/public/prototype/access-test-fixtures.js` trae datos de demostración
// (proyectos, proveedores, usuarios ficticios) para la demo local y las pruebas. Esos datos NO deben
// llegar al hosting: se publicaban en el código (cualquiera los veía con «Inspeccionar») y, en una
// instalación nueva, el primer administrador los guardaba en la base real (auditoría del 21-sep-2026).
// armar-publicacion.js copia este archivo encima del de demostración.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.VAAKFixtures = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const seed = {
    schemaVersions: { access: 2, relations: 2, resources: 2 },
    meta: { storeRevision: 0 },
    // La interfaz exige al menos un administrador activo para arrancar. Es un marcador genérico,
    // sin datos personales: al iniciar sesión un administrador o un trabajador, el servidor manda
    // el directorio real y este marcador desaparece (syncRemoteUsers reemplaza la lista).
    users: [{ id: "sistema", name: "Administración", email: "", username: "", role: "Admin", active: true }],
    projects: [],
    orders: [],
    suppliers: [],
    specs: [],
    tasks: [],
    projectMemberships: [],
    projectCompanies: [],
    supplierProjectLinks: [],
    clientProjectLinks: [],
    clientOrderAuthorizations: [],
    quarantine: [],
  };
  return Object.freeze({ seed: () => copy(seed), variant: (mutator) => { const value = copy(seed); mutator(value); return value; } });
});
