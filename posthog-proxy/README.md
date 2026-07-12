# PostHog reverse proxy

Proxy inverso mínimo (nginx) para servir PostHog desde un subdominio propio y
así esquivar los bloqueadores de anuncios/privacidad que tumban `*.posthog.com`.
Sin esto, los usuarios con adblock/Brave/Safari no generan replays ni eventos.

Sirve para **las dos** propiedades a la vez (la app en Lovable y la landing),
porque ambas solo cambian su `api_host` a este subdominio.

## Desplegar en EasyPanel

1. **Servicio nuevo** en EasyPanel de tipo *App* apuntando a este repo,
   carpeta `posthog-proxy/` (build por Dockerfile).
2. **Dominio**: asígnale un subdominio, p. ej. `ph.usapablo.app`
   (crea el registro DNS `CNAME ph → <target de EasyPanel>` y deja que
   EasyPanel emita el certificado TLS).
3. Deja el puerto interno en **80** (EasyPanel termina el TLS por delante).

## Verificar que quedó bien

```bash
# Debe devolver el SDK de PostHog (JS), no un 404:
curl -sI https://ph.usapablo.app/static/array.js | head -1   # 200

# Debe responder el endpoint de ingesta:
curl -s https://ph.usapablo.app/flags?v=2 -o /dev/null -w "%{http_code}\n"
```

## Activar en la app y la landing

Una vez el subdominio responde, se apunta `api_host` al proxy (yo hago este
cambio en el código cuando confirmes que el proxy está arriba):

- **App** (`src/lib/posthog.ts`): `api_host` → `https://ph.usapablo.app`,
  `ui_host` → `https://us.posthog.com`.
- **Landing** (`src/components/PostHogSnippet.astro` / build args): igual.

> Importante: NO cambiar `api_host` antes de que el proxy esté vivo y
> verificado, o se corta toda la telemetría hasta que lo esté.
