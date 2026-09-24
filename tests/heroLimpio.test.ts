import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Decisión de Rodrigo (17-sep y 24-sep-2026): el hero de la home termina en los dos
// CTAs. Sin badges de App Store / Google Play y sin subtítulo debajo del titular.
// Corre en CI (npm test) para que no vuelvan a colarse con otro cambio.
const hero = readFileSync(new URL("../src/components/sections/Hero.astro", import.meta.url), "utf8");

test("el hero no trae badges de tiendas", () => {
  for (const marca of ["AppDownloads", "store-badge", "App Store", "Google Play", "APP_STORE_URL"]) {
    assert.equal(hero.includes(marca), false, `Hero.astro contiene "${marca}"`);
  }
});

test("el hero no trae subtítulo", () => {
  assert.equal(hero.includes("hero__subtitle"), false, "Hero.astro contiene .hero__subtitle");
});
