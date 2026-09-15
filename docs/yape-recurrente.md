# Yape recurrente en la landing

Las entradas `StepCuentaPago` (onboarding) y `CuentaModal` (`/planes` y oferta) comparten `FlowMedios`: abren los campos de tarjeta automáticamente tras obtener el registro de `flow-suscripcion checkout`. Debajo aparece «Pagar con Yape recurrente», con el logo oficial de Flow servido localmente en `/payments/yape.svg`. Yape abre la URL oficial recibida, reutilizando ese token y el descuento ya validado.

`flow-webhook/retorno` ya devuelve el navegador al origen del checkout, por lo que se añade `/flow/retorno` en esta landing. La página recupera `pablo_sesion_tokens` desde sessionStorage, confirma el registro en el backend y renueva una sesión vencida si recibe 401. No crea otro checkout. Los tokens de sesión nunca se envían a Flow. El enlace de entrada a la app usa `/auth/sesion#...`, sin parámetro de plan, para instalar la sesión sin iniciar otra suscripción.

El retorno muestra cobro pendiente, prueba o período gratis según el resultado del backend. La página no carga analítica, usa no-referrer y noindex y se excluye del sitemap. La apertura del checkout mantiene InitiateCheckout; la acreditación de pagos sigue siendo del servidor.

Requisito comercial: el propietario confirmó el 14-sep-2026 que Flow habilitó Yape Recurrente. Documentación: https://web.flow.cl/es-pe/preguntas-frecuentes/yape-recurrente/ y https://developers.flow.cl/api.

Verificación: `npm test`, `npm run test:flow:ui` (instalar Chromium con `npx playwright install chromium` la primera vez) y `npm run build`. Las pruebas de navegador interceptan Flow y Supabase: no crean clientes ni hacen cobros reales.

Despliegue: push a `komus main` del repositorio `rayyan-komusf/pablo-landing`; después hay que pulsar Implementar en EasyPanel (el despliegue automático está desactivado). No requiere migraciones ni redeploy de Edge Functions en Lovable. Después del despliegue se puede comprobar que `/onboarding` contiene el selector y que `/flow/retorno` devuelve 200. La vinculación real y la renovación requieren una cuenta Yape autorizada.
