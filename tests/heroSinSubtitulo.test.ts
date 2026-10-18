import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Decisión de Rodrigo (17 y 24-sep, y otra vez 17-oct-2026): el hero de la home termina en el
// titular y los CTAs. Sin subtítulo debajo del titular, ni en orgánico ni en pauta, y sin badges
// de tiendas. Corre en CI (npm test) para que no vuelva a colarse con otro cambio.
const hero = readFileSync(new URL("../src/components/sections/Hero.astro", import.meta.url), "utf8");

test("el hero no trae subtítulo", () => {
  assert.equal(hero.includes("hero__subtitle"), false, "Hero.astro contiene .hero__subtitle");
});

test("el hero no trae badges de tiendas", () => {
  for (const marca of ["AppDownloads", "store-badge", "APP_STORE_URL", "GOOGLE_PLAY_URL"]) {
    assert.equal(hero.includes(marca), false, `Hero.astro contiene "${marca}"`);
  }
});
