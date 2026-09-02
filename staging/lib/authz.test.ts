import { describe, expect, it } from "vitest";
import { canReadClientDocument, canReadProject, canWriteProject, type AuthorizationContext } from "./authz";

const worker: AuthorizationContext = { role: "worker", companyId: "a", projectIds: ["p1"] };
const client: AuthorizationContext = { role: "client", companyId: "a", projectIds: ["p1"], grantedDocumentIds: ["po1"] };

describe("VAAK authorization boundaries", () => {
  it("denies cross-company access", () => expect(canReadProject(worker, "b", "p1")).toBe(false));
  it("denies a worker outside an assigned project", () => expect(canWriteProject(worker, "a", "p2")).toBe(false));
  it("denies client writes", () => expect(canWriteProject(client, "a", "p1")).toBe(false));
  it("requires an explicit client document grant", () => {
    expect(canReadClientDocument(client, "a", "po1")).toBe(true);
    expect(canReadClientDocument(client, "a", "po2")).toBe(false);
  });
});
