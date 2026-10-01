import { test } from "node:test";
import assert from "node:assert/strict";
import { destinoPagoPablo } from "../src/lib/checkoutApp.ts";
for (const plan of ["semanal", "mensual", "anual"]) test(`checkout ${plan} goes to authenticated app`, () => {
  const url = new URL(destinoPagoPablo(plan, "?utm_source=instagram&utm_campaign=septiembre"));
  assert.equal(url.origin, "https://usapablo.app"); assert.equal(url.pathname, "/pricing");
  assert.equal(url.searchParams.get("plan"), plan); assert.equal(url.searchParams.get("utm_source"), "instagram");
});
test("existing session stays in fragment and legacy coupon is not silently lost", () => {
  const url = new URL(destinoPagoPablo("mensual", "?utm_content=ad", "OLD50", { access_token: "test-access", refresh_token: "test-refresh" }));
  assert.equal(url.pathname, "/auth/sesion"); assert.equal(url.searchParams.get("codigo"), "OLD50");
  assert.equal(url.searchParams.get("access_token"), null);
  assert.equal(new URLSearchParams(url.hash.slice(1)).get("access_token"), "test-access");
});
test("untrusted plan and search cannot change payment destination", () => {
  const url = new URL(destinoPagoPablo("https://attacker.test", "?redirect=https://attacker.test"));
  assert.equal(url.origin, "https://usapablo.app"); assert.equal(url.searchParams.get("plan"), "mensual");
  assert.equal(url.searchParams.get("redirect"), null);
});
