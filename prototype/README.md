# VAAK local interactive demo

This is a dependency-free, local-only interface demo. It is not a production application and must never be deployed as authentication or authorization.

## Open it

Run a local static server from the workspace root and open `http://127.0.0.1:4173/`. Serving from the workspace root is intentional: it lets the interface load the approved `LOGO VAAK.png` asset shared with the project. It does not need packages or network access.

## What it illustrates

- Demo sign-in with four fictional accounts and a password visibility control.
- Admin, Worker and Client workspaces, plus a separate public tracking surface.
- Local forms for projects, demo users, suppliers, SPECs, task-status updates, client team members and purchase orders.
- Browser-only persistence through `localStorage`; reload keeps changes in the same browser profile.
- Admin-only access editor for every Worker and Client, with `Enabled`, `Disabled` and `No access` states.
- Central route and action guards, assigned-project filtering, and per-client purchase-order authorization for realistic local testing.

## Temporary demo accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin.vaak` | `VAAKdemo!26` |
| Worker | `worker.vaak` | `VAAKdemo!26` |
| Client | `client.vaak` | `VAAKdemo!26` |
| Client 2 | `client2.vaak` | `VAAKdemo!26` |

These values are deliberately public, fictional local-demo data. They are stored in browser-delivered JavaScript and are not secrets.

## Explicit limitations

This is not a secure application. Its sign-in, roles, access grants, project membership and document authorization are browser-side simulations; anyone with source or developer-tools access can see or alter them. The guards accurately exercise the intended interface behavior, but real security requires server-side identity, authorization, database policies/RLS and immutable audit records.

The local demo keeps a single `vaak-session-v6` value per browser origin. Therefore, tabs opened under the same localhost origin share the currently selected demo account. Use a separate browser profile or private window when comparing roles side by side. Storage changes are re-read in open tabs; authorization changes close active forms and force a fresh check.

If the stored demo data is malformed or no active administrator remains, the interface fails closed and shows the local recovery screen. Its reset button requires confirmation and removes only the two fictional local-storage keys listed below.

The versioned state is stored in `vaak-preview-v7`; the shared browser session remains in `vaak-session-v6`. Every successful mutation increments `meta.storeRevision`, and every protected open/commit re-reads both values. Ambiguous legacy relations are quarantined rather than converted into authority.

To reset the demo, use the confirmed recovery action. It replaces only `vaak-preview-v7` with the clean fictional seed and removes `vaak-session-v6`.

All displayed project, person, business, contact, document, code, date, and status information is fictional or neutral placeholder content. The only visual asset is the authorized local `LOGO VAAK.png` branding asset.
