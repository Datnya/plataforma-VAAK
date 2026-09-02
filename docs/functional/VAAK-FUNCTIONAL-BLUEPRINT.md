---
artifact_type: FUNCTIONAL_BLUEPRINT
phase: "functional_blueprint"
ref: "VAAK-FUNCTIONAL-1-A"
from: architect_chief
to: reviewer_auditor
status: delivered_for_audit
blocking: false
created_at: "2026-08-26"
---

# VAAK functional blueprint

## Scope and status

This is a requirements blueprint, not product code, a data model, an implementation authorization, or an approved ADR. It translates the human decisions recorded in `HANDOFF/ORDEN-VAAK-FUNCTIONAL-1-A.md` into user-facing English copy, screens, rules and acceptance criteria. Unresolved decisions remain explicitly unresolved.

All user-facing UI copy, including navigation, labels, validation messages, statuses and documents, must be in English. Internal governance documentation may remain in Spanish.

## Navigation and access

| Area | Intended route / UI copy | Roles | Traceability | Acceptance criterion |
|---|---|---|---|---|
| Sign-in | `Sign in`, `Username`, `Password`, `Show password`, `Hide password` | Admin, Worker, Client | FUN-001--FUN-004 | Login presents the authorized local VAAK logo and brown, white and gold direction; the password control only changes visibility of entered text. |
| Internal dashboard | `Projects`, `Signed in as`, role label | Admin, Worker | FUN-004, FUN-010--FUN-013 | Header identifies the authenticated user and role; Worker receives only assigned projects. |
| Project workspace | `Projects / [Project name]` | Admin, assigned Worker | FUN-030--FUN-042 | Project pages separate general information, areas, client team and results. |
| Operations | `Specifications`, `Suppliers`, `Purchase Orders` | Admin, assigned Worker | FUN-050--FUN-053; Q-FUN-01, Q-FUN-05 | Every operation is scoped to an authorized project and auditable. |
| Administration | `Tools`, `Create New User`, `User Management`, `Add New Project`, `Supplier Management`, `Official VAAK Platform Guide` | Admin | FUN-013, FUN-020--FUN-024 | Server-side authorization, not visual hiding alone, protects the area. |
| Client portal | `Reports`, `Purchase Order History` | Client | Q-FUN-02 | Client sees only explicitly authorized records for its linked company/project. |
| Public lookup | `Track your product`, `Tracking code`, `Check status` | Public, separate from portal | CLT-002 | A code exposes only the minimum permitted logistics status and never grants portal access. |

## Screens and functional rules

### 1. Sign-in

- Use `LOGO VAAK.png` as the local authorized brand asset. Final hexadecimal tokens and fonts remain pending contrast/accessibility validation.
- Authentication uses username and password. `Show password` / `Hide password` is optional visibility for the current input only; it never reveals stored credentials.
- Account recovery, MFA, password policy, lockout and session duration are pending security design; no behavior is implied here.

### 2. Internal project dashboard

- The first view for Admin and Worker is `Projects`, presented as project cards with an authorized cover image or neutral placeholder.
- A card must identify the project without using real client sample data. Filters, ordering, recency rules and image-upload behavior are pending.
- The Worker dashboard also includes `My tasks`, limited to tasks assigned to that Worker in authorized projects, with due date and current status.
- Admin has `Tools`; this does not change the fact that operational POs and SPECs may be issued by Workers in their project scope.

### 3. Project workspace

| Section | Required data / UI copy | Edit rule currently documented | Traceability |
|---|---|---|---|
| `General Information` | `Legal Business Name`, `Tax ID`, `Tax ID Type`, `Country`, `Fiscal Address`, `Delivery / Warehouse Address`, `Installation Start Date`, `Hotel Opening Date` | Admin management is proposed; assigned Worker has full read access but cannot edit project-general data. | FUN-030, FUN-040--FUN-042, Q-FUN-04, Q-FUN-06 |
| `Project Areas` | room count/types, residence count/types, common-area name and floor | Entity details and editing rules remain pending. | FUN-031 |
| `Client Team Members` | `First name`, `Last name`, `Job title`, `Phone`, `Email`, `Add New Member` | A contact is not automatically a Client account. Editing authority remains pending matrix implementation. | FUN-032 |
| `Project Results` | task/objective, created date, responsible user, `Due date`, status | `Pending`, `In Progress`, `Completed`; color is supplementary only. Worker may change only the status of a task assigned to them. | FUN-033, FUN-041, FUN-042 |

### 4. Operational work

- `Specifications`: Admin and assigned Worker may view, create and manage SPECs within project scope. A SPEC code must be unique, traceable and never reused. Technical sheets and real images wait for authorized source material and a separate document/PDF decision.
- `Suppliers`: Admin manages the overall supplier view. Assigned Worker may add and manage suppliers related to assigned projects. Duplicate prevention and audit records are required; global catalog design remains pending.
- `Purchase Orders`: Admin and assigned Worker may create and issue POs in a project. Worker issuance does not require Admin review or issuance. The form must use authorized project data, including client identity, Tax ID and delivery/warehouse address, and record issue date and issuer.
- A PO selects SPECs by code and must validate that the SPEC is usable in the authorized project. PO numbering, taxes, currencies, prices, lifecycle, approvals, signature, sending and final PDF template are pending a separate REF.
- Every creation, change, issuance and own-task status change requires auditable actor, timestamp and project context when implemented.

### 5. Admin tools and account retention

`User Management` must support listing users, role filtering, create, username/password editing, immediate disable and conservative deletion handling. Disabling must revoke access and retain activity history. A user with activity is logically archived rather than physically erased; physical deletion is only a future option for a user with no activity, after confirmation and impact review. This is a functional policy, not an implemented retention mechanism.

`Official VAAK Platform Guide` is a private placeholder for a future PDF supplied by the human. No guide file, external link, generation or access policy is created in this REF.

### 6. Client portal and tracking

- The logged-in Client portal is restricted to authorized reports and authorized PO history for the linked company/project. It has no internal project dashboard, Suppliers, SPEC, task, payment, project-editing or PO-creation permissions.
- Public tracking is a different, minimal surface. It uses an opaque, high-entropy, revocable/expirable code; rate limits and uniform responses prevent enumeration. A valid tracking code never reveals PO history, amounts, addresses, identities or reports.

## Data boundaries and non-goals

- `Tax ID` is generic and paired with tax-ID type and country; no national tax scheme is assumed.
- Use only fictional data, authorized placeholders and owned assets in a future demo. Do not reuse data, photos, names, contacts, addresses, amounts, brands or documents from the client reference PDF.
- Demo users, credentials, fixtures, passwords, password hashes, code, deployment, database changes, PDFs and infrastructure changes are excluded from this REF.

## Pending decisions requiring a later REF

1. Final PO fields, numbering, taxes, currencies, pricing, approvals, signing, sending, retention and PDF template.
2. Full Project Areas model, task checklist semantics, due-date timezone, notifications and task state transitions.
3. Password recovery, MFA, password policy, session handling and client-document visibility rules.
4. Supplier fields, duplicate-matching approach and global/project catalog relationship.
5. Final accessibility, responsive behavior, contrast, typography and upload rules.

## Source traceability

- Human instruction, 2026-08-26: FUN-001--FUN-053 and Q-FUN-01--Q-FUN-06 as recorded in the ORDEN.
- `HANDOFF/ORDEN-VAAK-FUNCTIONAL-1-A.md` and `HANDOFF/VEREDICTO-VAAK-FUNCTIONAL-1-A.md`.
- `docs/ux/VAAK-UX-REFERENCE.md` and `docs/roles/README.md`.

