import { test } from "node:test";
import assert from "node:assert/strict";
import { cerrarSesionCurso, haySesionCurso, loginCurso, verificarAccesoCurso } from "../src/lib/cursoAcceso.ts";

const key = "pablo_curso_sesion";
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
const expired = { access_token: "old", refresh_token: "refresh", expires_at: 0 };

async function fixture(run: (store: Map<string, string>) => Promise<void>) {
  const savedFetch = globalThis.fetch;
  const savedStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  } });
  try { await run(store); }
  finally {
    cerrarSesionCurso();
    globalThis.fetch = savedFetch;
    if (savedStorage) Object.defineProperty(globalThis, "localStorage", savedStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
}

test("un corte de red al renovar devuelve null y conserva la sesión para reintentar", () => fixture(async (store) => {
  store.set(key, JSON.stringify(expired));
  globalThis.fetch = async () => { throw new Error("offline"); };
  assert.equal(await verificarAccesoCurso("curso"), null);
  assert.equal(haySesionCurso(), true);
}));

test("dos consultas simultáneas comparten una sola renovación", () => fixture(async (store) => {
  store.set(key, JSON.stringify(expired));
  let renewals = 0;
  globalThis.fetch = async (url) => {
    if (String(url).includes("refresh_token")) {
      renewals++;
      return json({ access_token: "new", refresh_token: "rotated", expires_in: 3600 });
    }
    return json({ ok: true, acceso: true, progreso: [] });
  };
  const results = await Promise.all([verificarAccesoCurso("curso"), verificarAccesoCurso("curso")]);
  assert.equal(renewals, 1);
  assert(results.every((r) => r?.acceso));
}));

test("fallo temporal del servidor no borra credenciales", () => fixture(async (store) => {
  store.set(key, JSON.stringify(expired));
  globalThis.fetch = async () => json({ message: "unavailable" }, 503);
  assert.equal(await verificarAccesoCurso("curso"), null);
  assert.equal(haySesionCurso(), true);
}));

test("token revocado sí cierra la sesión", () => fixture(async (store) => {
  store.set(key, JSON.stringify(expired));
  globalThis.fetch = async () => json({ message: "invalid refresh token" }, 400);
  assert.equal(await verificarAccesoCurso("curso"), null);
  assert.equal(haySesionCurso(), false);
}));

test("sin localStorage el login dura en memoria durante la página", () => fixture(async () => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("storage blocked"); } });
  globalThis.fetch = async (url) => String(url).includes("grant_type=password")
    ? json({ access_token: "memory", refresh_token: "memory-refresh", expires_in: 3600 })
    : json({ ok: true, acceso: true, progreso: [] });
  assert.equal((await loginCurso("test@example.invalid", "fake-test-password")).ok, true);
  assert.equal(haySesionCurso(), true);
  assert.equal((await verificarAccesoCurso("curso"))?.acceso, true);
}));
