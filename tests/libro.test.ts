import { test } from "node:test";
import assert from "node:assert/strict";
import { base64ABytes, erroresHoja, mensajeConfirmacion, type HojaForm } from "../src/lib/libro.ts";

const ok: HojaForm = { nombre: "Ana Prueba", documento_tipo: "DNI", documento_numero: "12345678", domicilio: "Av. Prueba 123", telefono: "987 654 321", correo: "ana@example.invalid",
  es_menor: false, representante_nombre: "", representante_documento: "", representante_correo: "", bien_descripcion: "Suscripción Pablo mensual", monto_reclamado: "",
  detalle: "Me cobraron dos veces.", pedido: "Que me devuelvan un cobro.", declaracion_aceptada: true };

test("una hoja completa no tiene errores", () => assert.deepEqual(erroresHoja(ok), {}));

test("marca cada campo incompleto", () => {
  const e = erroresHoja({ ...ok, nombre: "", documento_numero: "123", correo: "x", telefono: "abc", detalle: "corto", pedido: "", declaracion_aceptada: false, monto_reclamado: "-3" });
  for (const k of ["nombre", "documento_numero", "correo", "telefono", "detalle", "pedido", "declaracion_aceptada", "monto_reclamado"]) assert.ok(e[k], k);
});

test("CE acepta letras y el menor de edad exige al representante", () => {
  assert.deepEqual(erroresHoja({ ...ok, documento_tipo: "CE", documento_numero: "ab123456" }), {});
  const e = erroresHoja({ ...ok, es_menor: true });
  assert.ok(e.representante_nombre && e.representante_documento && e.representante_correo);
  assert.deepEqual(erroresHoja({ ...ok, es_menor: true, representante_nombre: "Luis Prueba", representante_documento: "87654321", representante_correo: "luis@example.invalid" }), {});
});

test("la confirmación dice número, correo, plazo y el contacto", () => {
  const m = mensajeConfirmacion({ numero: "PABLO-001-2026-00001", tipo: "reclamo", fecha: "25 de noviembre de 2026", correo: "ana@example.invalid", copia: "enviada" });
  for (const parte of ["PABLO-001-2026-00001", "ana@example.invalid", "15 días hábiles", "team@usapablo.com", "spam"]) assert.ok(m.includes(parte), parte);
  assert.ok(mensajeConfirmacion({ numero: "X", tipo: "queja", fecha: "f", correo: "a@b.co", copia: "pendiente" }).includes("Estamos enviando"));
});

test("base64 vuelve a bytes", () => assert.deepEqual([...base64ABytes("JVBERg==")], [37, 80, 68, 70]));
