# Atribución Meta — octubre de 2026

Cambios vinculados a la integración de Whop en `pablo-finance-pal`:

- Conserva `_fbc` completo durante siete días y captura `fbclid` incluso cuando el script remoto del pixel tarda o está bloqueado.
- Solo decora enlaces HTTPS al dominio exacto `usapablo.app`.
- PageView incorpora `page_location` y `page_path` del documento actual, sin copiar query ni fragmento a esos campos. La URL nativa del pixel mantiene su comportamiento estándar.
- El clic previo en el selector de planes se llama `CheckoutPlanSelected`. `InitiateCheckout` lo confirma el backend cuando existe un checkout de Whop listo.
- La exclusión del popup de moneda para `utm_medium=paid` ya estaba implementada; la prueba ejecuta ese mismo control.

## Publicación coordinada

Publicar después de aplicar la migración y desplegar las funciones Whop/Meta de `pablo-finance-pal`. Comprobar el build arg `PUBLIC_META_PIXEL_ID` en el EasyPanel de Pablo. Activar el trabajador del backend solo cuando se haya verificado que Whop/Meta no tienen otro emisor de las mismas compras.

El remoto de publicación es `komus` (`rayyan-komusf/pablo-landing`), no `origin`.

## Evidencia local

`npm test`: 28 pruebas aprobadas. `npm run build`: 25 páginas generadas correctamente.

Pendiente: despliegue verificado, prueba real del anuncio a compra, panel de Meta/EMQ y revisión de un posible emisor externo que altere PageView. Los pasos del onboarding siguen siendo `OnboardingStep`; no se inventan rutas nuevas.
