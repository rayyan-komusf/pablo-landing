import { test } from "node:test";
import assert from "node:assert/strict";
import { errorCarne, esCorreo, esCorreoEdu, MAX_CARNE_BYTES } from "../src/lib/estudiante.ts";

test("acepta correos .edu de universidades", () => {
  for (const c of ["a2023@pucp.edu.pe", "U202312@UPC.EDU.PE", " alumno@ulima.edu.pe ", "x@uni.edu", "x@mail.unmsm.edu.pe"]) {
    assert.equal(esCorreoEdu(c), true, c);
  }
});

test("rechaza correos educativos que no son .edu", () => {
  for (const c of ["ana@gmail.com", "ana@educacion.pe", "ana@edu.pe", "ana@", "ana pucp.edu.pe", "ana@upn.pe"]) {
    assert.equal(esCorreoEdu(c), false, c);
  }
});

test("el correo registrado puede ser cualquier correo válido", () => {
  assert.equal(esCorreo("ana.torres@gmail.com"), true);
  assert.equal(esCorreo("a2023@pucp.edu.pe"), true);
  assert.equal(esCorreo("ana.torres"), false);
});

test("la foto del carné tiene que ser una imagen de hasta 8 MB", () => {
  assert.equal(errorCarne({ size: 900_000, type: "image/jpeg" }), null);
  assert.equal(errorCarne({ size: 2_000_000, type: "image/heic" }), null);
  assert.match(errorCarne(null) ?? "", /Sube la foto/);
  assert.match(errorCarne({ size: 0, type: "image/jpeg" }) ?? "", /Sube la foto/);
  assert.match(errorCarne({ size: 1000, type: "application/pdf" }) ?? "", /JPG, PNG/);
  assert.match(errorCarne({ size: MAX_CARNE_BYTES + 1, type: "image/png" }) ?? "", /8 MB/);
});
