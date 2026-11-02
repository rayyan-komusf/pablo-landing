import { test } from "node:test";
import assert from "node:assert/strict";
import { conPrecioLista } from "../src/lib/precioLista.ts";

test("orgánico: el enlace de compra lleva precio=lista", () => {
  const url = new URL(conPrecioLista("https://usapablo.app/pricing?plan=anual&continuar=1", false));
  assert.equal(url.searchParams.get("precio"), "lista");
  assert.equal(url.searchParams.get("plan"), "anual");
});
test("orgánico: el puente de sesión con plan también, y el hash no se toca", () => {
  const url = conPrecioLista("https://usapablo.app/auth/sesion?plan=mensual#access_token=a&refresh_token=b", false);
  assert.match(url, /precio=lista#access_token=a&refresh_token=b$/);
});
test("pauta: la app cobra la oferta, sin precio=lista", () => {
  assert.equal(conPrecioLista("https://usapablo.app/pricing?plan=anual", true), "https://usapablo.app/pricing?plan=anual");
});
test("no toca registros gratis, otras rutas ni otros dominios", () => {
  for (const u of [
    "https://usapablo.app/auth/sesion?plan=free",
    "https://usapablo.app/dashboard",
    "https://usapablo.app/auth?gratis=1",
    "https://evil.test/pricing?plan=anual",
    "no es url",
  ]) assert.equal(conPrecioLista(u, false), u);
});
test("local: también decora la app de desarrollo", () => {
  assert.equal(new URL(conPrecioLista("http://localhost:8080/pricing?plan=mensual", false)).searchParams.get("precio"), "lista");
});
