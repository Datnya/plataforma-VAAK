---
artifact_type: ORDEN
phase: "1"
ref: "VAAK-IMPLEMENTATION-1-A"
from: architect_chief
to: reviewer_auditor
status: draft_for_review
blocking: true
created_at: "2026-08-26"
---

# ORDEN — VAAK-IMPLEMENTATION-1-A · local visual foundation

## Original human instruction

> "entonces dime como abririamos esa REF de implementación, yo te autorizo a hacer lo que necesites para proceder"

This text is preserved verbatim. It authorizes preparation of this REF, but it does not override the governance gate: no implementation begins until this ORDEN has an independent `APROBADO` verdict.

## Task

After this REF is approved and execution is explicitly authorized, create a **dependency-free, local-only visual prototype** of the VAAK entry experience and internal project dashboard. It is a disposable UI-validation increment, not the production application and not an architecture decision.

The prototype must show the VAAK visual direction (authorized local logo; brown, white and gold), English-only user-facing copy, a non-authenticating sign-in screen with a password visibility control, and static role-scoped views for Admin, Worker and Client using only fictional/neutral placeholders. It must make the Worker project boundary and Client portal/tracking separation visible without implementing authentication, authorization, persistence or public tracking.

## Why this is the first increment

The functional blueprint and role contracts are approved, while the final PHP/Laravel decision is not an approved ADR and staging remains blocked by DNS/TLS/PHP verification. A dependency-free local visual prototype can validate the approved user-facing direction now without assuming Composer, SSH, a database, credentials, Laravel, Vercel, cPanel or a deployment route.

## Scope for the future Executor

1. Create only the minimum static local artifact necessary to open the prototype in a browser from the workspace, without package installation, build tooling, external requests, a server requirement or a deployment configuration.
2. Include a sign-in visual state with `Username`, `Password`, `Show password` and `Hide password`. The visibility control may toggle only the typed field in the browser; it must not submit, save, validate or reveal any credential.
3. Include visual, explicitly non-authenticated previews of:
   - Admin: `Projects`, signed-in header/role label, one fictional project card and `Tools` labels for user, project and supplier management.
   - Worker: assigned-project-only presentation, full read-only project information, `My tasks`, and visible operations for `Specifications`, `Suppliers` and `Purchase Orders` within an assigned-project context.
   - Client: a distinct signed-in portal surface limited to `Reports` and `Purchase Order History`, plus a separately labelled, non-functional public `Track your product` lookup surface.
4. Use the local authorized `LOGO VAAK.png` asset. Use only neutral placeholders and fictional labels; do not copy people, contacts, organizations, addresses, amounts, images or documents from source PDFs.
5. Add a short local README for the prototype explaining how to open it, its non-production status, the fictional-data rule and the exact functional boundaries it illustrates.
6. Provide an ENTREGA with a file inventory, manual browser verification steps, a search showing no credentials/secrets or client-reference data, and an explicit statement of all exclusions.

## Mandatory functional boundaries

- All visible interface strings must be in English; governance/readme material may be in Spanish.
- A Worker view may present all information for an assigned project, but must not visually offer project-general editing, user/role/access administration, global settings or modification of another person’s task.
- A Worker view may visibly support its approved operational scope: SPECs, suppliers and Purchase Orders only in assigned projects, and status-only change for an own task. It must not claim that any action is actually persisted or issued.
- The Client portal must not present an internal project dashboard, suppliers, SPECs, task management, PO creation, payment data or unapproved documents. The public tracking surface must never display identities, addresses, amounts, reports or PO history.
- No static UI control is evidence of real authorization. Every interactive/non-interactive prototype control must be labelled or documented as a visual demonstration where needed.

## Explicit exclusions

- No Laravel, PHP framework, Composer, Node, npm, uv, pip, database, migration, model, API, server process, package or dependency installation.
- No authentication, session, password policy, account recovery, MFA, authorization middleware, tracking-code generation, rate limiting, audit log, persistence, email, PDF, upload, order issuance, supplier/spec/task mutation or client-document access.
- No users, demo accounts, passwords, password hashes, credentials, secrets, `.env` files, fixtures containing client data or real data.
- No Git initialization or configuration, commit, branch, push, merge, GitHub change, Vercel configuration, cPanel change, DNS/TLS/PHP change, remote database connection or staging/production deployment.
- No adoption of Laravel/PHP version or other technology as an ADR. No claim of hosting compatibility beyond the already documented conditional research.

## Pending decisions deliberately deferred

1. Final technology ADR: framework/version, PHP target, dependency build-and-upload workflow, database/data model and test stack.
2. Repository initialization and source-control workflow; this workspace has no verifiable Git root, and this REF must not create one.
3. Authentication/session/MFA/recovery/password policy, server-side authorization model and audit-retention design.
4. Purchase Order fields, numbering, currency, pricing, taxes, lifecycle, PDF, signature and sending.
5. Detailed data model for areas, contacts, suppliers, task rules, reports, Client document grants and tracking states.
6. Staging readiness: authoritative DNS resolution, valid TLS, subdomain PHP version/extensions, rewrite/webroot, transfer/permissions, backup restore, MySQL privileges and provider resource limits.

## Acceptance criteria for the future execution

1. The prototype opens locally without installing packages or contacting an external service.
2. The sign-in screen, password visibility behaviour and the three visual role contexts are manually verifiable in a browser.
3. The logo source is the authorized local asset, and visible user-facing copy is English.
4. Admin, Worker and Client views comply with the approved functional blueprint and permission matrix, including Worker scope and Client/tracking separation.
5. Search-based evidence shows the created artifact contains no secrets, credentials, client data or content copied from the reference PDFs.
6. The prototype README lists its local opening procedure, limitations and explicit non-production status.
7. No excluded operation, package, remote action, Git action or infrastructure change occurs.

## Security and quality controls

- Treat every static role view as a design preview only; do not imply access control from hidden controls.
- Do not collect, persist or prefill usernames, passwords, tracking codes or other sensitive values. Browser-side password visibility is transient only.
- Use semantic HTML, keyboard-operable password visibility and basic contrast-aware styling. Formal accessibility validation remains a later decision.
- Keep the prototype entirely local; no analytics, fonts, CDN assets, remote images, telemetry or network calls.
- Preserve a clear separation between owned VAAK branding and unapproved client/reference-PDF data.

## Expected evidence in ENTREGA

- Exact changed-file list and purpose.
- Command/output proving no dependency manifest, package installation or external configuration was added.
- Search output for prohibited credential/secrets patterns and known reference-PDF sample data, with the search terms documented.
- Browser verification notes for the sign-in view, password visibility, Admin, Worker, Client and public tracking surfaces.
- Explicit exclusions and deviations, if any.

## Future sequence after this REF

1. `reviewer_auditor` independently audits this ORDEN. If approved, the human may authorize execution of this local-only prototype.
2. The Executor completes the prototype and submits an evidence-based ENTREGA under the same REF.
3. `reviewer_auditor` audits the delivered artifact; approval does not adopt a stack or authorize deployment.
4. A later, separate REF resolves the technology ADR and repository/bootstrap plan before any framework, database, authentication or persistent product increment.
5. A separate staging REF resumes only after the documented DNS/TLS/PHP blockers are evidenced as resolved.

## Audit focus

The reviewer must reject scope creep into application code, dependencies, fake credentials, real/client data, technology adoption, remote operations or deployment. It must verify that role previews do not accidentally grant a Worker unapproved controls or reveal restricted Client/tracking information.

## Source traceability

- Human instruction preserved above, 2026-08-26.
- `AGENTS.md`.
- `PROJECT-BRAIN.md` and `PROJECT-STATE.md`.
- `HANDOFF/VEREDICTO-VAAK-FUNCTIONAL-1-A.md`.
- `docs/functional/VAAK-FUNCTIONAL-BLUEPRINT.md`.
- `docs/functional/VAAK-ROLE-PERMISSIONS.md`.
- `docs/roles/ADMIN.md`, `docs/roles/WORKER.md`, `docs/roles/CLIENT.md`.
