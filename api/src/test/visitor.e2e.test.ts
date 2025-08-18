import { describe, it, expect } from "bun:test";

const BASE = process.env.ACTIVE_API_ORIGIN || `http://localhost:${process.env.PORT || 8000}`;

function parseSetCookie(setCookie: string[] | undefined) {
  const jar: Record<string, string> = {};
  if (!setCookie) return jar;
  for (const c of setCookie) {
    const [pair] = c.split(";");
    const idx = pair.indexOf("=");
    if (idx > 0) {
      const k = pair.slice(0, idx).trim();
      const v = pair.slice(idx + 1).trim();
      jar[k] = v;
    }
  }
  return jar;
}

function cookiesToHeader(jar: Record<string, string>) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function http(method: string, path: string, body?: any, cookieJar?: Record<string, string>) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookieJar && Object.keys(cookieJar).length ? { Cookie: cookiesToHeader(cookieJar) } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const text = await res.text();
  let data: any = undefined;
  try { data = JSON.parse(text); } catch {}
  const setCookie = res.headers.getSetCookie?.() as any as string[] | undefined;
  const newCookies = parseSetCookie(setCookie);
  return { res, text, data, cookies: newCookies };
}

describe("Visitor E2E", () => {
  const now = Date.now();
  const empEmail = `host.${now}@example.com`;
  const visEmail = `visitor.${now}@example.com`;
  const password = "Password123!";

  const empJar: Record<string, string> = {};
  const visJar: Record<string, string> = {};
  let hostEmployeeDbId: string | undefined;

  it("registers a host employee", async () => {
    const { res, data } = await http("POST", "/employees/register", {
      email: empEmail,
      password,
      fullName: "Host Emp",
      employeeId: `EH${now}`,
      department: "Frontdesk",
      title: "Reception",
    });
    // 200/201 OK
    expect([200, 201]).toContain(res.status);
  });

  it("signs in host employee to get id", async () => {
    const result = await http("POST", "/employees/sign", { email: empEmail, password });
    expect(result.res.status).toBe(200);
    Object.assign(empJar, result.cookies);
    hostEmployeeDbId = result.data?.data?._id;
    expect(hostEmployeeDbId).toBeDefined();
  });

  it("registers a visitor", async () => {
    const { res } = await http("POST", "/visitors/register", {
      email: visEmail,
      password,
      fullName: "Vis Tester",
      name: "Visitor Name",
      phone: "+10000000000"
    });
    expect([200, 201]).toContain(res.status);
  });

  it("signs in visitor", async () => {
    const result = await http("POST", "/visitors/sign", { email: visEmail, password });
    expect(result.res.status).toBe(200);
    Object.assign(visJar, result.cookies);
    expect(Object.keys(visJar).length).toBeGreaterThan(0);
  });

  it("visitor clock IN requires hostEmployeeId (negative)", async () => {
    const r = await http("POST", "/attendance/visitor/clock", { action: "IN" }, visJar);
    // Should be 400 due to validator
    expect([400, 422]).toContain(r.res.status);
  });

  it("visitor clocks IN and OUT with host", async () => {
    expect(hostEmployeeDbId).toBeDefined();
    const r1 = await http("POST", "/attendance/visitor/clock", { action: "IN", hostEmployeeId: hostEmployeeDbId }, visJar);
    expect([200, 201]).toContain(r1.res.status);
    const r2 = await http("POST", "/attendance/visitor/clock", { action: "OUT", hostEmployeeId: hostEmployeeDbId }, visJar);
    expect([200, 201]).toContain(r2.res.status);
  });
});
