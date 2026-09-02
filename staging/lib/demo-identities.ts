const demoIdentities = [
  { username: "admin.vaak", email: "datnyamonzon1+vaak-admin@gmail.com" },
  { username: "worker.vaak", email: "datnyamonzon1+vaak-worker@gmail.com" },
  { username: "client.vaak", email: "datnyamonzon1+vaak-client@gmail.com" },
] as const;

export function resolveDemoIdentity(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  return demoIdentities.find(
    (identity) => identity.username === normalized || identity.email === normalized,
  );
}

export function usernameForEmail(email: string | undefined) {
  return demoIdentities.find((identity) => identity.email === email?.toLowerCase())?.username;
}
