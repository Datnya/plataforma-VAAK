---
artifact_type: ROLE_PERMISSION_MATRIX
phase: "functional_blueprint"
ref: "VAAK-FUNCTIONAL-1-A"
from: architect_chief
to: reviewer_auditor
status: delivered_for_audit
blocking: false
created_at: "2026-08-26"
---

# Proposed role permission matrix

## Reading this matrix

This is a proposed functional authorization matrix, not an implemented access-control system. `Allowed` reflects an explicit human decision. `Proposed` needs later data/security design. `Not allowed` is an explicit boundary. Every allowed internal action is constrained by authenticated role and project scope, and must be enforced server-side in implementation.

| Capability | Admin | Worker | Client | Scope, limit and traceability |
|---|---|---|---|---|
| Sign in with username/password | Allowed | Allowed | Allowed | FUN-003; client portal is separate from tracking. |
| View internal projects dashboard | Allowed | Allowed | Not allowed | Worker: assigned projects only; FUN-010. |
| View full project data | Allowed | Allowed | Not allowed | Worker: all data of assigned projects, including Tax ID, addresses and contacts; Q-FUN-06. |
| Edit project general information | Proposed | Not allowed | Not allowed | Admin scope awaits implementation design; Worker limit is explicit; FUN-030/FUN-041. |
| View project areas/client contacts/results | Allowed | Allowed | Not allowed | Worker only within assigned projects; FUN-031--FUN-033. |
| Add/manage project areas and client contacts | Proposed | Proposed | Not allowed | No silent permission grant; requires later detailed design. |
| View tasks | Allowed | Allowed | Not allowed | Worker sees tasks in assigned projects; personal view is required; FUN-012. |
| Create/edit/assign tasks | Proposed | Not allowed except own status | Not allowed | Worker cannot alter text, assignee, due date or other users' tasks; FUN-040--FUN-042. |
| Update own assigned task status | Proposed | Allowed | Not allowed | Only `Pending`, `In Progress`, `Completed`; audit actor/time/project; FUN-042. |
| View SPECs | Allowed | Allowed | Not allowed | Worker: assigned projects; FUN-051. |
| Create/manage SPECs | Allowed | Allowed | Not allowed | Worker: assigned projects only; unique, non-reused code; Q-FUN-01/FUN-050--051. |
| View suppliers | Allowed | Allowed | Not allowed | Worker: suppliers tied to assigned projects; FUN-024/Q-FUN-05. |
| Add/manage suppliers | Allowed | Allowed | Not allowed | Worker: assigned projects only; prevent duplicates and audit; Q-FUN-05. |
| Create and issue purchase orders | Allowed | Allowed | Not allowed | Worker: assigned projects; Admin approval/emission is not required; Q-FUN-01/FUN-052. |
| View purchase orders | Proposed | Proposed | Allowed | Client only receives explicitly authorized history for linked company/project; Q-FUN-02. |
| Create/update/delete users | Allowed | Not allowed | Not allowed | Admin list/filter/create/edit; deletion is conservatively constrained; FUN-020--021. |
| Disable user immediately | Allowed | Not allowed | Not allowed | Revoke access, retain history; Q-FUN-03. |
| Logical archive / physical deletion of user | Allowed | Not allowed | Not allowed | Archive active-history accounts; physical deletion only if no activity, subject to confirmation/impact design; Q-FUN-03. |
| Assign roles/project access | Allowed | Not allowed | Not allowed | Admin administration; implementation must audit grant/revocation. |
| Global settings | Proposed | Not allowed | Not allowed | No settings set is defined yet. |
| Read authorized reports | Proposed | Not allowed | Allowed | Client only linked and explicitly authorized reports; Q-FUN-02. |
| Use public product tracking | Not applicable | Not applicable | Separate/public | Opaque code; minimal status only; does not grant portal access; CLT-002. |

## Guardrails

- “Allowed” does not bypass authorization checks, audit logging, project assignment or data minimization.
- A Worker never receives user, role, access-assignment, global-settings, project-general-edit or other-user-task privileges merely through UI visibility.
- A Client account is not created by adding a Client Team Member; identity linkage needs later design.
- Client PO/report access needs an explicit authorization relation; no document is public by default.
- PDF generation, download, signature, sending, payment workflows and document retention are outside this matrix until separately specified.

## Source traceability

Human decisions Q-FUN-01 through Q-FUN-06, 2026-08-26; FUN-010--FUN-053; `HANDOFF/ORDEN-VAAK-FUNCTIONAL-1-A.md`; `HANDOFF/VEREDICTO-VAAK-FUNCTIONAL-1-A.md`.

## Local prototype delivery — 2026-08-31

REFs `VAAK-ACCESS-3-A` and `VAAK-ACCESS-3-B` were rejected. REF `VAAK-ACCESS-3-C` is delivered for audit as a browser-only simulation in `prototype/access-control.js` and `prototype/access-runtime.js`:

- Admin has fixed full access and is the only role allowed to manage users and grants.
- Worker and Client grants support `enabled`, `disabled` and `none` states.
- Navigation, routes and actions use the same deny-by-default authorization source.
- Worker project pages require an explicit project membership.
- Client purchase-order access requires explicit client, company, project and order links.
- Legacy records are migrated without inventing authority; ambiguous relations are quarantined.
- New and existing accounts require explicit access confirmation after identity, role, grant or scope changes.
- The local verification runner reports C01–C39 and generates 20 correlated ES/EN browser captures.

This implementation is suitable for localhost interface testing only. It does not replace backend authorization or database RLS.
