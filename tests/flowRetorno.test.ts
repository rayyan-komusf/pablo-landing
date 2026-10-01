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
test("retired returns cannot confirm, charge, or contact Flow", () => fixture(async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error("unexpected provider request"); };
  await assert.rejects(confirmarRetornoFlow("old-token"), /sistema anterior/);
  await assert.rejects(confirmarRetornoFlow(""), /sistema anterior/);
  assert.equal(calls, 0);
}));
test("historical return flags cannot claim trial or payment success", () => {
  const message = mensajeConfirmacionFlow({ ok: true, en_trial: true, periodo_gratis: true });
  assert.equal(message.titulo, "Revisa tu suscripción");
  assert.doesNotMatch(message.detalle, /gratis|activa|renovará/);
});

test("el puente no inicia otro checkout y entrega sesión solo en fragmento", () => fixture(async () => {
  const url = new URL(urlAppTrasFlow());
  assert.equal(url.origin, "https://usapablo.app");
  assert.equal(url.pathname, "/auth/sesion");
  assert.equal(url.search, "");
  assert.equal(new URLSearchParams(url.hash.slice(1)).get("access_token"), "access");
}));
