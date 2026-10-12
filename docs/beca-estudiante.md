# Beca de estudiantes

Esta landing depende de `solicitud-estudiante` y las dos migraciones de becas del PR #14 de pablo-finance-pal. El backend queda cerrado por defecto. La página verifica su disponibilidad con GET y no permite cargar documentos hasta recibir `disponible:true`.

El formulario excluye sus campos del autocapture de PostHog, conserva la foto solo en memoria, libera la vista previa y limpia el archivo al confirmar. Un HTTP 200 sin `ok:true` no se presenta como una solicitud recibida. Los reintentos se deduplican por contenido en el servidor. El consentimiento se registra allí con versión y fecha.

La aprobación es manual; no se promete una activación sin revisar. No hay compra ni concesión de Premium desde esta página. La cuenta debe crearse antes de enviar y el equipo debe comprobar su titularidad.

Validación: 32 pruebas unitarias, build Astro, dos recorridos Playwright con respuestas simuladas (backend cerrado y recibo inválido/reintento). Los tests de navegador bloquean dominios externos; no suben carnés ni envían emails reales. La recepción real y la activación de la campaña quedan pendientes del despliegue y la comprobación del backend.
