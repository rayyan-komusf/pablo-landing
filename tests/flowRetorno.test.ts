import { test } from "node:test";
import assert from "node:assert/strict";
import { confirmarRetornoFlow, mensajeConfirmacionFlow, urlAppTrasFlow, FLOW_SESION_KEY } from "../src/lib/flowRetorno.ts";

async function fixture(run: (store: Map<string, string>) => Promise<void>) {
  const oldFetch = globalThis.fetch;
  const oldStorage = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  const store = new Map([[FLOW_SESION_KEY, JSON.stringify({ access_token: "access", refresh_token: "refresh" })]]);
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  } });
  try { await run(store); } finally {
    globalThis.fetch = oldFetch;
    if (oldStorage) Object.defineProperty(globalThis, "sessionStorage", oldStorage);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  }
}
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });

test("confirma únicamente el registro recibido, sin crear checkout", () => fixture(async () => {
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /flow-suscripcion$/);
    assert.deepEqual(JSON.parse(String(options?.body)), { accion: "confirmar", token: "registration" });
    return json({ ok: true, en_trial: true });
  };
  assert.equal((await confirmarRetornoFlow("registration")).en_trial, true);
}));

test("sesión vencida: renueva y confirma el mismo token una sola vez", () => fixture(async store => {
  const requests: string[] = [];
  globalThis.fetch = async (url, options) => {
    requests.push(String(url));
    if (requests.length === 1) return json({ error: "expired" }, 401);
    if (requests.length === 2) {
      assert.match(String(url), /grant_type=refresh_token/);
      return json({ access_token: "new-access", refresh_token: "new-refresh" });
    }
    assert.deepEqual(JSON.parse(String(options?.body)), { accion: "confirmar", token: "same-token" });
    assert.equal(new Headers(options?.headers).get("Authorization"), "Bearer new-access");
    return json({ ok: true });
  };
  await confirmarRetornoFlow("same-token");
  assert.equal(requests.length, 3);
  assert.equal(JSON.parse(store.get(FLOW_SESION_KEY)!).refresh_token, "new-refresh");
}));

test("sin sesión ni token nunca hace peticiones", () => fixture(async store => {
  globalThis.fetch = async () => { throw new Error("no debe llamarse"); };
  await assert.rejects(confirmarRetornoFlow(""), /código de Flow/);
  store.clear();
  await assert.rejects(confirmarRetornoFlow("token"), /sesión/);
}));

test("rechazo y error HTTP nunca se convierten en éxito", () => fixture(async () => {
  globalThis.fetch = async () => json({ ok: false, error: "No vinculado" });
  await assert.rejects(confirmarRetornoFlow("token"), /No vinculado/);
  globalThis.fetch = async () => json({ ok: true }, 503);
  await assert.rejects(confirmarRetornoFlow("token"), /No pudimos confirmar/);
}));

test("pendiente gana sobre trial y período gratis", () => {
  for (const flag of ["acceso_bloqueado", "pago_pendiente", "cobro_pendiente"]) {
    const mensaje = mensajeConfirmacionFlow({ ok: true, [flag]: true, en_trial: true, periodo_gratis: true });
    assert.equal(mensaje.titulo, "Medio de pago vinculado");
    assert.match(mensaje.detalle, /todavía/);
  }
});

test("el puente no inicia otro checkout y entrega sesión solo en fragmento", () => fixture(async () => {
  const url = new URL(urlAppTrasFlow());
  assert.equal(url.origin, "https://usapablo.app");
  assert.equal(url.pathname, "/auth/sesion");
  assert.equal(url.search, "");
  assert.equal(new URLSearchParams(url.hash.slice(1)).get("access_token"), "access");
}));
