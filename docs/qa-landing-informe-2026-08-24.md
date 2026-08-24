# Informe · QA + VA total de la landing (24-ago-2026)

**Rama**: `diseno/onboarding-glowup` · commits `216f9c2`, `599d58c`, `aac6fe5` (pusheados, solo la rama). `npm run build` pasa (23 páginas). Todo lo afirmado abajo está medido; la evidencia visual vive en el scratchpad de la sesión (tiras de frames por escena, zooms, capturas por viewport).

## 1 · Las escenas animadas (foco principal)

### Diagnóstico medido de lo que había

Se extrajeron **todos los frames de las 8 escenas** (654 frames) con alfa y se midieron por frame: bbox, gap inferior, blobs conexos, orla magenta, nitidez (varianza laplaciana) y empalme de loop. Confirmado con evidencia:

| Escena | Defecto confirmado | Causa raíz |
|---|---|---|
| cama | postura 2 con **brazo extra y DOS celulares**; postura 3 con **cabeza deforme** (globo, cara incoherente) + **parche magenta entre las piernas**; pantalla del teléfono **magenta puro** en postura 1 | deriva del modelo en los raws + `binary_fill_holes` a ciegas |
| corriendo | **magenta brillante entre las piernas** (frames 10–36); intro "disuelta" (frames 1–8); **las placas nunca se encendían** (el loop elegido cayó en el tramo del raw sin iluminación); llama fantasma en f14 | fill de huecos + crossfade con empalme 0.0458 + selección de loop |
| celular | **astillas magenta detrás del cuerpo** en toda la segunda mitad; migas naranjas alucinadas; **scrub laggeado** | fill de huecos + el encode de hoy había perdido `-g 8` (1 keyframe por archivo → cada seek decodifica desde el frame 0) |
| onb-donut | **agujero del donut en magenta opaco** en 37 de 38 frames (debía ser transparente) | fill de huecos |
| onb-ahorro | 360KB (presupuesto 200KB) + la más borrosa del set (nitidez 151 vs 1000–3500 del resto) | encode + fuente blanda |

### Qué se hizo

1. **Pipeline parcheado** (`pipeline_escena.py`): el relleno de huecos ahora es selectivo — un hueco encerrado cuyo interior es croma queda transparente. Flags nuevos `--gop N` (keyframes densos para scrub) y `--lado N`. Con esto solo, donut y ahorro quedaron arreglados desde sus raws (donut 172KB con agujero transparente; ahorro 157KB a 360px de ancho).
2. **Regeneración con Higgsfield** (pedido de Rodrigo), método aprobado: stills compuestos por PIL con recortes oficiales — `FB10_corriendo` sobre fila de placas reales del raw (sin llamitas ni basura del still anterior), `FB02_saludando` junto al teléfono del frame bueno, los 3 stills de cama existentes — → Kling 3.0 turbo (loops) y minimax_h3 con start+end image (transición del celular), prompts con cláusulas anti-deriva explícitas. VA frame a frame de los 5 raws nuevos ANTES de instalar: un celular, dos brazos, casco casquete con zigzag, cabeza coherente incluso al revés, placas que se encienden al pisar, cero migas.
3. **Pesos finales**: cama 157KB · corriendo 170KB · celular 179KB (16 I-frames/124 = `-g 8` verificado) · donut 172KB · ahorro 157KB. Todos ≤200KB.

### Verificación en página (Playwright, Chromium real)

- Dims declaradas = dims reales de video en los 3 slots nuevos (`512×508`, `512×330`, `512×442`) → **cero salto de layout** medido (bbox del slot idéntico antes/después de cargar).
- Reproducen a la vista y **pausan fuera del viewport** (los 4 loops); el respaldo PNG solo se oculta tras `loadeddata`; con `prefers-reduced-motion` **ningún video recibe src** y el respaldo queda visible.
- **Scrub del celular ida y vuelta: 0.53 → 2.54 → 4.59 → 2.57 → 0.53** — simétrico y exacto (antes del fix, con el archivo sin keyframes: 0.32→4.48→1.18, no volvía). El lag que reportó Rodrigo era esto.

### VA de identidad, escena por escena (contra M4 + 05_specs)

- **cama** ✓ nuevas 3 posturas: casco-casquete con zigzag dorado, ojos marrones, blush, un solo celular, pantalla verde (WhatsApp), cortes duros intactos. Nota: esta corrida no dibuja la ventana nocturna (los stills nunca la tuvieron; la ronda anterior la alucinó). A mi ojo la escena se sostiene; si la quieres de vuelta hay que componerla en los stills.
- **corriendo** ✓ FB10 oficial, placas que se encienden doradas al pisar (pedido explícito), sin fuego, sin magenta, sin sombra horneada. La escala Pablo/placas cambió (placas más chicas, estilo piano-tiles).
- **celular** ✓ asomada detrás del teléfono → saludo junto al ícono dorado. Observación menor: en los frames finales los sparkles de los ojos quedaron algo más grandes que los del master (minimax abrió los ojos del FB02, que los tenía cerrados-felices). No lo veo rechazable, pero es tu ojo el que manda.
- **presupuesto / soles / deuda** (no regeneradas): quedan con observaciones — la cara de presupuesto parpadea entre expresiones dentro del loop de 1.6s (f22/f30/f34 con cejas raras), soles tiene un frame con ojos-ranura (f24) y su loop empalma a Pablo de pie con Pablo agachado; deuda tiene ghost leve en f1 (crossfade). Ninguna fue objetada por Rodrigo; regenerarlas es media hora más de Higgsfield si las quiere.

## 2 · QA general (medido en 320/393/768/1280)

**PASA** (números):
- `scrollWidth − clientWidth = 0` en los 4 viewports, recorrido completo de la página incluido (lazy content disparado). Consola: **0 errores** en los 4.
- Teléfono del hero completo entre navbar y borde inferior en los 4 (p.ej. 1280×720: navbar 72 / teléfono 130–662 / viewport 720).
- Banner sticky: `data-oculto` en hero → visible pasado el hero (translateY −67.32px → 0) → se esconde al volver. El respaldo por scroll cubre pestañas en segundo plano, como promete su comentario.
- Olas: las 5 con `margin-top:-1px`, `fill` = color del bloque de arriba y fondo = bloque de abajo, incluidas las dos fronteras navy (verificado por computed style + captura).
- Testimonios: la página no desborda; el track anima por transform.
- Lead magnets: links a `/blog/plantilla-detox-financiero` y `/cursos/camino-al-millon` presentes; portada del curso carga.
- Promos: 3 portadas distintas (`crea con pablo y gana.jpeg`, `pablo-points.webp`, `chancha-portada.webp`).
- Footer: 18 links → todos 200 en local (excepto el 404 conocido de la plantilla sin Notion key, que en prod existe); IG 200, Skool 307 (redirect normal).
- Popup de la moneda: cero emojis, tuteo, triggers exit-intent/20s (desktop) y 11s/50% scroll (móvil), kill-switch PostHog, no se encima con otros modales, reaparición 30 días. Sin hallazgos.

**ARREGLADO en esta ronda** (commits 2 y 3):
- Titular 1 de Funciones a 320px quedaba en **3 líneas** (viuda por el `<br>`): bajo 360px baja a 22px → 2 líneas en los 5 titulares (medido post-fix). Ojo: hizo falta reiniciar el dev server para verlo — vite servía el módulo de estilos viejo.
- **Áreas táctiles**: links del footer 18px → 44px (padding + margen negativo), sociales 36→44 y logos del navbar/banner (::before), sin mover un pixel del layout (área efectiva verificada 44px).
- **LinkedIn del footer apuntaba a `/admin/dashboard/`** (login-wall para cualquier visitante) → página pública de la compañía.
- Ícono de gastos hormiga rehecho: hormiga normal perfil-lateral estilo emoji de Apple en el clay del set (nanobanana + refs gm04/ac05, flood-fill, 96×96). Verificada en vivo en el onboarding.

**REPORTADO, no tocado** (decisiones de Rodrigo):
- Headlines amarillos 1.85–2.03:1 — decisión §6, se quedan. Medidos: 6 headlines.
- ⚠️ **"Ya tengo una cuenta" (CTA secundario del hero): #F59E0B sobre blanco = 2.15:1 a 15px.** No es headline, así que NO lo cubre la excepción §6 y viola el AA duro del brief. No lo cambié porque es color de marca de botón: captura en `cta-ya-tengo-cuenta.png`. Opciones: mismo ámbar oscurecido (#B45309, 4.6:1) o navy.
- Portada de promo con espacios en el nombre (`/crea con pablo y gana.jpeg`): funciona, pero es frágil para CDNs/deploys. Renombrar cuando toque.

## 3 · Lo que NO pude verificar y por qué

- **Reproducción visual en el panel embebido del navegador**: el panel estuvo oculto toda la sesión (el SO congela rAF/video en pestañas no visibles) — todo lo dinámico se verificó en Chromium real vía Playwright, y la identidad visual con frames extraídos por ffmpeg. No es un hueco de cobertura, solo otra herramienta.
- **El e2e del pixel de Meta/TikTok/GA4**: gateado por hostname a usapablo.com (correcto, no se tocó); en local no dispara por diseño.
- **iOS Safari real**: el alfa VP9 no existe en Safari < 17.4; el respaldo PNG cubre (verificado el mecanismo, no el device físico).
- **La página del curso exige plan pagado**: gate de backend, ya reportado antes, fuera de alcance.

## 4 · Deuda que queda

1. "Ya tengo una cuenta" a 2.15:1 (decisión de Rodrigo pendiente).
2. presupuesto/soles/deuda con las observaciones de cara/empalme de arriba (regenerables con la misma receta si Rodrigo quiere).
3. La ventana nocturna de la cama ya no está (¿la extrañas?).
4. `crea con pablo y gana.jpeg` con espacios.
