# Brief · QA total de la landing de Pablo (usapablo.com)

**Rol:** eres UI/UX engineer de QA para la landing de Pablo, app de finanzas personales peruana (asesor financiero por WhatsApp). Tu trabajo: auditar TODA la landing y **arreglar lo que encuentres**, con foco especial en las **animaciones de escena, que todavía tienen problemas**. El fundador (Rodrigo) revisa a ojo y rechaza lo que no parece el personaje oficial.

**Regla madre: mide, no opines.** Cada afirmación visual necesita un número (bbox, ratio de contraste, scrollWidth, peso en KB, frame extraído). Verifica en navegador de verdad, no asumas desde el código.

---

## 0 · Repo y reglas duras

| Qué | Valor |
|---|---|
| Repo | `/Users/rosol/Documents/Claude/repos/pablo-landing` (Astro 6 + vanilla JS) |
| Rama de trabajo | `diseno/onboarding-glowup` — **JAMÁS pushees a main** (main = deploy automático a producción) |
| Dev server | `npm run dev -- --port 4321` (o preview con `.claude/launch.json`, nombre `pablo-landing`) |
| Build obligatorio | `npm run build` debe pasar antes de cada commit (los errores 401 de Notion en /blog son normales sin API key: el blog cae con gracia) |
| Commits | en español, explicando el porqué, **sin Co-Authored-By** |

Reglas de contenido: español peruano con tuteo, cero emojis en la UI, prohibido lenguaje culposo y urgencia falsa. Responsive duro: 320/393/768/1280 px, sin scroll horizontal, sin texto cortado, área táctil ≥44px. Contraste AA 4.5:1 medido — **con UNA excepción consciente** (ver §6).

**Los pixels de Meta/TikTok/GA4 están gateados a `usapablo.com`** por hostname en los layouts: tus pruebas en localhost no ensucian medición. No toques ese guard.

---

## 1 · El personaje: specs innegociables

Pablo **nunca se genera de cero**. Fuente de verdad:

```
/Users/rosol/Documents/Claude/Projects/Pablo/visual assets/
  pablo_2d_fullbody/03_master/M4_master_joints_cadera_finos.png   ← master de estilo
  pablo_2d_fullbody/04_set_fullbody/FB01…FB37                     ← poses oficiales
  PABLO_CHARACTER_SHEET/sheets/05_specs.png                       ← vistas 360°, proporciones, hex
  PABLO_CHARACTER_SHEET/_art/props_lib/                           ← props oficiales (hormiga, soldadito…)
```

- Cuerpo crema `#FBF3E4`, ~2 cabezas de alto, casco marrón brillante **fusionado** (casquete arriba, cara y frente amplias — NO casco integral tipo moto).
- Emblema del casco = **flecha zigzag dorada**. NUNCA un sol, nunca un swirl liso.
- **Ojos: marrones sólidos con sparkles pequeños.** PROHIBIDO: pestañas, brillos blancos grandes (la pose FB27_moneda está vetada por esto). Prohibida la pose de ambos brazos arriba en V (el render 3D `pablo-wave` viejo).
- Orejas-disco marrones, blush rosado, correa de pecho, manitas mitón, botitas con suela.

**Método aprobado para escenas** (así se hicieron las actuales): los props se generan con nanobanana; Pablo entra por **composición PIL de los recortes oficiales**; Kling anima; para transiciones se usa `tail_image` con el frame final compuesto a mano. Si regeneras una escena, sigue ese método — pedirle a un modelo que dibuje a Pablo termina en caras dobles o cascos de moto (ya pasó).

---

## 2 · Arquitectura de la landing

`src/pages/index.astro`, orden actual de `<main>`:

```
Hero → Features (4 tarjetas) → Funciones (5 bloques con escenas + descarga navy)
→ Testimonials → FinalCTA (navy) → LeadMagnets (plantilla + curso) → FAQ → Footer
```

Componentes clave:
- `src/components/sections/Hero.astro` + `HeroPhone.astro` — hero 100dvh con iPhone simulado. ⚠️ El alto del teléfono lo manda su `font-size` (todo en em) que ahora escala con `--w`; el ancho se clampea por altura de viewport (`min(340px, calc((100svh - 160px)/2.1))`). Si tocas el teléfono, verifica a 1280×720 Y 393×852 que no se corte contra navbar ni viewport.
- `src/components/sections/Funciones.astro` — los 5 bloques de beneficio. Título+descripción centrados, **headlines en Outfit + amarillo CTA `#F5A623` + tracking −0.03em**, títulos partidos en 2 líneas con `<br>`. Bloques alternan lila `#f5f3ff` / blanco, la descarga es **navy `#2b2c64`**, separados por **olas SVG** (`.fx-ola[data-desde=…]`: el path toma el color del bloque de arriba vía `currentColor`, el contenedor el de abajo).
- `src/components/BannerSticky.astro` — barra que baja al pasar el hero (IntersectionObserver + respaldo por scroll, init diferido a DOMContentLoaded porque el componente se monta antes de `<main>`).
- `src/components/sections/LeadMagnets.astro` — plantilla (mini-réplica animada CSS) → `/blog/plantilla-detox-financiero`; curso (portada real `/cursos/camino-al-millon.webp` + play pulsante) → `/cursos/camino-al-millon`.
- `src/components/Footer.astro` — 4 columnas: Conoce a Pablo / Recursos / Sobre nosotros (La Komu → `https://www.skool.com/lakomu`) / Términos y privacidad.
- `src/pages/promos.astro` — cada promo con su portada (`promo.image`).

---

## 3 · Las escenas animadas (TU FOCO PRINCIPAL)

**Formato:** WebM VP9 con canal alfa (`yuva420p`), servidas desde `public/onboarding/images/pablo/2d/`. Presupuesto de peso: **≤200KB** por escena (88% del tráfico es móvil peruano).

Inventario actual:

| Archivo | Dónde se usa | Dim | Peso | Nota |
|---|---|---|---|---|
| `escena-cama.webm` | landing #companero | 512×560 | 196KB | 3 posturas con cortes duros (teletransporte, pedido explícito) |
| `escena-presupuesto.webm` | landing #sin-esfuerzo | 512×482 | 172KB | |
| `escena-corriendo.webm` | landing #motivacion | 512×492 | 165KB | placas que se encienden al pisar |
| `escena-soles.webm` | landing #claridad | 512×328 | 164KB | soldaditos-moneda marchando |
| `escena-celular.webm` | landing #descarga | 512×434 | 184KB | **transición, NO loop** — se scrubbea con el scroll (`--p`), encodeada con keyframes densos |
| `escena-onb-donut/deuda/ahorro.webm` | onboarding steps 10/nuevo-2/nuevo-4 | varias | 166–360KB | ⚠️ ahorro pesa 360KB, sobre presupuesto |

**Cómo funciona el slot** (en `Funciones.astro`): cada bloque tiene `[data-escena]` con `<img>` de respaldo (recorte oficial) + `<video data-src>`. Un script activa el video solo si `canPlayType('video/webm; codecs="vp9"')` y no hay `prefers-reduced-motion`; reproduce **solo cuando está a la vista** (IntersectionObserver); el respaldo no se oculta hasta `loadeddata`. Las `dim {w,h}` declaradas en `BLOQUES` **deben calzar con el video real** o el layout salta al cargar.

**Pipeline de regeneración** (todo existe, no lo reescribas):
```
Projects/Pablo/visual assets/pablo_anim_landing/
  raws/            ← *_raw.mp4 de Kling (fondo magenta)
  pipeline_escena.py   ← croma normalizado + despill + multi-blob + crop unión
       flags: --pops A B C (cama) · --no-loop (celular) · --zap-top · --despill-hard
```
Fondo SIEMPRE magenta plano; nada toca los bordes del encuadre; el borde inferior del crop es el suelo (ahí cae la sombra de contacto de la web).

### QA frame a frame que debes hacer a cada escena

Extrae tiras (`ffmpeg -vcodec libvpx-vp9 -i X.webm -vf "select='not(mod(n\,12))',scale=190:-1,tile=6x1"` sobre lila `#e9e4f7`) y revisa:

1. **Identidad**: casco casquete con zigzag dorado, ojos marrones sin pestañas, una sola cara, proporción 2 cabezas — en TODOS los frames, no solo el primero (Kling deriva a mitad de clip).
2. **Recorte**: sin orla magenta/rosa en contornos, sin agujeros en el cuerpo, sin blobs fantasma flotando.
3. **Loop**: el empalme no salta (compara primer vs último frame); la cama usa cortes duros a propósito — ahí verifica que cama/ventana NO se muevan entre posturas.
4. **Sombra**: los pies del personaje quedan a ≤3% del borde inferior del video (la sombra CSS se dibuja ahí).
5. **En página**: reproduce en su slot, pausa fuera de viewport, respaldo visible si bloqueas el video, sin salto de layout al cargar (mide el bbox del slot antes/después).
6. **Celular**: al scrollear el bloque #descarga arriba/abajo el video debe scrubbear ida y vuelta suave (keyframes densos); verifica que `--p` avanza (el bloque tiene `data-parallax`).
7. **Peso**: si regeneras, ≤200KB; `escena-onb-ahorro` (360KB) ya está fuera de presupuesto — bájala si puedes sin matar las monedas.

---

## 4 · QA general de la landing (checklist)

En 320 / 393 / 768 / 1280 px, y desktop bajo (1280×720):

- [ ] `scrollWidth === clientWidth` en toda ruta (excepción conocida: el carrusel de testimonios desborda POR DISEÑO dentro de su track; la página no debe scrollear)
- [ ] Teléfono del hero completo entre navbar y borde inferior
- [ ] Banner sticky: oculto arriba, baja al pasar el hero, se esconde al volver (pruébalo con scroll REAL, no programático)
- [ ] Olas: sin líneas de 1px entre bloque y ola (el `margin-top: -1px` las mata); colores correctos en las fronteras navy
- [ ] Títulos en 2 líneas se ven bien en 320px (que el `<br>` no genere viudas raras)
- [ ] Footer: los 18+ links responden (ojo `/blog/plantilla-detox-financiero` da 404 en local sin Notion key — en producción existe, no lo "arregles")
- [ ] Lead magnets: plantilla animada gira/llena en loop; portada del curso carga; CTAs navegan
- [ ] Promos: 3 portadas distintas
- [ ] Parallax `--p`: baja y sube — los elementos vuelven exactamente a su lugar
- [ ] `prefers-reduced-motion`: TODA animación quieta, videos sin reproducir, respaldos visibles
- [ ] Consola limpia en todo el recorrido

---

## 5 · Cómo verificar (el estándar de la casa)

```bash
cd /Users/rosol/Documents/Claude/repos/pablo-landing && npm run dev -- --port 4321
```
- Overflow: `document.documentElement.scrollWidth - clientWidth` por ruta y por sección.
- Contraste: calcula luminancia WCAG contra el fondo **ya mezclado** (los fondos semitransparentes dan falsos negativos si mides contra el rgba).
- Videos: `video.currentTime` avanzando + `!video.paused` dentro de viewport, `paused` fuera.
- Screenshots de cada escena reproduciendo, como evidencia.
- Ten en cuenta: los paneles automatizados a veces estrangulan timers/scroll — si un scroll programático no mueve `scrollY`, usa `scrollIntoView` + `dispatchEvent(new Event('scroll'))`, y desconfía de mediciones de tiempo.

---

## 6 · Decisiones tomadas que NO debes "corregir"

1. **Headlines amarillos `#F5A623` sobre blanco/lila dan ~1.97:1 y violan AA.** Es decisión explícita de Rodrigo (patrón Duolingo). NO los cambies a oscuro; si encuentras uno ilegible de verdad, repórtalo con captura.
2. La **cama teletransporta** entre 3 posturas con cortes duros — es el chiste, pedido explícito. No lo suavices.
3. El donut muestra el fondo por su agujero → transparente. Correcto, no es un bug.
4. `/blog/plantilla-detox-financiero` 404 en local = falta de Notion API key, no un link roto.
5. La mini-plantilla de LeadMagnets es una réplica CSS porque el screenshot real no existe en este disco.

## 7 · Deuda conocida (arregla si puedes, reporta si no)

- `escena-onb-ahorro.webm` 360KB (presupuesto 200KB).
- El curso como lead magnet manda a una página que exige plan pagado (gate backend, fuera de tu alcance — no lo toques, ya está reportado).
- Los headlines amarillos (ver §6).

## 8 · Entregable

1. Informe con **números y capturas**: qué revisaste, qué falló, qué arreglaste, qué queda.
2. Fixes aplicados y verificados (build pasa, barridos repetidos post-fix).
3. Commits en español en `diseno/onboarding-glowup`, push SOLO de esa rama.
4. Lista explícita de lo que NO pudiste verificar y por qué.
