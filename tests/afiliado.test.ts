import { test } from "node:test";
import assert from "node:assert/strict";
import { afiliadoVigente, capturarAfiliado, conAfiliado, CLAVE_AFILIADO } from "../src/lib/afiliado.ts";
import { destinoPagoPablo } from "../src/lib/checkoutApp.ts";

function conStorage(run: (store: Map<string, string>) => void) {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
  } });
  try { run(store); } finally { Reflect.deleteProperty(globalThis, "localStorage"); }
}

test("?a= válido se guarda; el último link gana y el inválido no lo pisa", () => conStorage(() => {
  capturarAfiliado("?a=juan");
  capturarAfiliado("?utm_source=ig&a=maria.p_23");
  for (const malo of ["?a=x", `?a=${"x".repeat(41)}`, "?a=%3Cscript%3E", "?a=a%20b", "?a="]) capturarAfiliado(malo);
  assert.equal(afiliadoVigente(), "maria.p_23");
}));

test("el afiliado vence a los 30 días", () => conStorage((store) => {
  store.set(CLAVE_AFILIADO, JSON.stringify({ codigo: "maria", ts: Date.now() - 31 * 86400000 }));
  assert.equal(afiliadoVigente(), null);
  assert.equal(store.has(CLAVE_AFILIADO), false);
  store.set(CLAVE_AFILIADO, JSON.stringify({ codigo: "maria", ts: Date.now() - 29 * 86400000 }));
  assert.equal(afiliadoVigente(), "maria");
}));

test("sin storage (Safari privado) nada se rompe", () => {
  capturarAfiliado("?a=maria");
  assert.equal(afiliadoVigente(), null);
  assert.equal(conAfiliado("https://usapablo.app/pricing"), "https://usapablo.app/pricing");
});

test("conAfiliado solo decora usapablo.app y conserva query y fragmento", () => conStorage(() => {
  capturarAfiliado("?a=maria");
  const url = new URL(conAfiliado("https://usapablo.app/auth/sesion?plan=anual#access_token=t"));
  assert.equal(url.searchParams.get("a"), "maria");
  assert.equal(url.searchParams.get("plan"), "anual");
  assert.equal(url.hash, "#access_token=t");
  for (const ajena of ["https://whop.com/checkout/x", "http://usapablo.app/", "/planes", "https://usapablo.app.evil.test/"]) {
    assert.equal(conAfiliado(ajena), ajena);
  }
}));

test("destinoPagoPablo lleva a desde la URL actual o desde lo guardado", () => {
  assert.equal(new URL(destinoPagoPablo("anual", "?a=maria")).searchParams.get("a"), "maria");
  assert.equal(new URL(destinoPagoPablo("anual", "?a=%3Cx%3E")).searchParams.get("a"), null);
  assert.equal(new URL(destinoPagoPablo("anual", "")).searchParams.get("a"), null);
  conStorage(() => {
    capturarAfiliado("?a=juan");
    assert.equal(new URL(destinoPagoPablo("anual", "")).searchParams.get("a"), "juan");
    const conSesion = new URL(destinoPagoPablo("mensual", "?a=maria", "", { access_token: "t", refresh_token: "r" }));
    assert.equal(conSesion.pathname, "/auth/sesion");
    assert.equal(conSesion.searchParams.get("a"), "maria");
  });
});
