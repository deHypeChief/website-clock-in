import { describe, it, expect, beforeAll } from "bun:test";

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

describe("Attendance E2E", () => {
  const now = Date.now();
  const empEmail = `emp.${now}@example.com`;
  const adminEmail = `admin.${now}@example.com`;
  const password = "Password123!";

  const empJar: Record<string, string> = {};
  const adminJar: Record<string, string> = {};
  let employeeId: string | undefined;

  it("server is up", async () => {
    const r = await fetch(`${BASE}/`);
    expect(r.ok).toBeTrue();
  });

  it("registers an employee", async () => {
    const { res, data } = await http("POST", "/employees/register", {
      email: empEmail,
      password,
      fullName: "Emp Test",
      employeeId: `E${now}`,
      department: "Ops",
      title: "Analyst",
    });
    expect([200, 201]).toContain(res.status);
    expect(data?.success).toBeTrue();
  });

  it("signs in employee", async () => {
    const result = await http("POST", "/employees/sign", {
      email: empEmail,
      password,
    });
    expect(result.res.status).toBe(200);
    expect(result.data?.success).toBeTrue();
    // capture cookies
    Object.assign(empJar, result.cookies);
    employeeId = result.data?.data?._id;
    expect(Object.keys(empJar).length).toBeGreaterThan(0);
  });

  it("employee clocks IN and OUT", async () => {
    const r1 = await http("POST", "/attendance/employee/clock", { action: "IN" }, empJar);
    expect([200, 201]).toContain(r1.res.status);
    const r2 = await http("POST", "/attendance/employee/clock", { action: "OUT" }, empJar);
    expect([200, 201]).toContain(r2.res.status);
  });

  it("registers and signs admin", async () => {
    const reg = await http("POST", `/admins/register?role=admin`, {
      email: adminEmail,
      password,
      fullName: "Admin Test",
    });
    expect([200, 201]).toContain(reg.res.status);

    const sign = await http("POST", "/admins/sign", {
      email: adminEmail,
      password,
    });
    expect(sign.res.status).toBe(200);
    Object.assign(adminJar, sign.cookies);
    expect(Object.keys(adminJar).length).toBeGreaterThan(0);
  });

  it("admin can fetch attendance records", async () => {
    const q = new URLSearchParams({ actorType: "employee" }).toString();
    const r = await http("GET", `/attendance/admin/records?${q}`, undefined, adminJar);
    expect([200, 401]).toContain(r.res.status);
    expect(Array.isArray(r.data?.data)).toBeTrue();
  });

  it("admin daily summary endpoint responds", async () => {
    const r = await http("GET", "/attendance/admin/summary/daily", undefined, adminJar);
    expect([200, 401]).toContain(r.res.status);
  });

  it("admin totals per-employee endpoint responds", async () => {
    expect(employeeId).toBeDefined();
    const r = await http("GET", `/attendance/admin/totals/employee/${employeeId}`, undefined, adminJar);
    expect([200, 401]).toContain(r.res.status);
  });
});
