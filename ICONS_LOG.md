# ICONS_LOG

Registro del set de íconos 3D de **Pablo** integrado en la landing y en el onboarding.

## De dónde salen

Son generaciones que ya existían en la cuenta de Higgsfield. **No se gastó ningún crédito.** El recorte, el reescalado y la conversión se hicieron en local.

- **Estilo:** arcilla 3D brillante con alfa real.
- **Paleta:** azul rey, celeste, amarillo, coral y menta. Calza con el navy, ámbar y verde de Pablo.
- **Proyecto en Higgsfield:** está guardado como *"Atlas — banco de iconos y animaciones (30-09)"*, pero ese nombre quedó mal. **Todos estos íconos son de Pablo.** El conector de Higgsfield no permite renombrar proyectos, así que el nombre hay que cambiarlo a mano en la web.

## Archivos

Todos se recortaron al alfa y se centraron en un cuadrado. Los formatos:

| Ruta | Tamaño | Uso | Peso |
|---|---|---|---|
| `public/landing/iconos/*.webp` | 240×240 | Se muestran a 50–120px | 10–18 KB c/u |
| `public/onboarding/images/iconos/pablo/*.webp` | 160×160 | Se muestran a 22–54px | 352 KB los 33 |

## Lo que no cambió

- El set pastel anterior (`public/onboarding/images/iconos/*.png`) sigue en el repo pero ya no se usa.
- La única excepción es `an01_hormiga.png`, que se mantiene a propósito. El commit `599d58c` eligió "una hormiga de verdad" y el set de Pablo no tiene hormiga.

## Utilidades globales (`src/styles/global.css`)

**`.icono-flota`** es un acento decorativo:
- Va en `position:absolute` dentro de un contenedor relativo.
- El tamaño sale de `--s`.
- Lleva `drop-shadow(0 12px 14px rgba(43,44,100,.2))`.
- Flota con `iconoFlota`: sube 10px y gira entre `--r0` y `--r1`. El ritmo sale de `--dur` y el desfase de `--delay`.
- Tiene `pointer-events:none` y siempre `aria-hidden`.

**`.icono-flota--oscuro`** aplica una sombra más profunda para fondos navy.

**`.icono-ancla`** es el ícono sobre un título de sección:
- El tamaño sale de `--s`.
- El halo difuso es un `::before` con `blur(22px)` y color `--halo`.
- La flotación es lenta.

Con `prefers-reduced-motion: reduce` todas estas animaciones se apagan.

---

### Landing Page

| Sección | Íconos | Tratamiento |
|---|---|---|
| **Hero** | alcancía, diana, monedas | Orbitan el iPhone con `.icono-flota` a 92/76/84px, cada uno con su ritmo. En ≤1024px bajan a 60px. En ≤768px se ocultan para no romper el ajuste del hero al viewport. |
| **Features** (4 cards) | chat (WhatsApp), lupa sobre barras (reportes), campana (recordatorios), diana (metas) | Reemplazan los SVG de trazo genéricos. Más detalle abajo. |
| **Funciones** (5 bloques) | chat · barras · fuego (racha) · monedas · celular | Un sello `.fx-sello` en la esquina superior de cada escena: 52px en móvil y 78px en desktop. En los bloques invertidos cambia de lado. La posición sale del mismo `--w` de la escena y en móvil se acota con `min(…, 100% - var(--s))` para no cortarse. |
| **Testimonios** | tres estrellas | `.icono-ancla` de 110px (88 en móvil) con halo ámbar sobre "Gente real, resultados reales". |
| **CTA final** (navy) | alcancía, cohete, estrella | `.icono-flota--oscuro` a los lados del bloque. Más detalle abajo. |
| **LeadMagnets** | dona (plantilla), birrete (curso) | Asomados sobre el prop de cada escena: 70px en desktop y 50px en móvil. |
| **FAQ** | burbuja con "?" | Ancla de 92px (76 en móvil) con halo celeste y flotación de 4.5s. |
| **/planes · encabezado** | trofeo | `.icono-ancla` de 96px (76 en móvil) sobre el badge. |
| **/planes · Plan gratis** | brote (etiqueta) y chat, tarjeta, diana, dona, lápiz (lista) | Los bullets `disc` pasan a tiles blancos de 44px: borde `1.5px #e8e5f2`, `border-radius:14px` y canto `0 3px 0 0`. |

**Detalle de Features:**
- El tile pasa de 56px a 104px (88 en ≤390px), con `border-radius: 30px`.
- Fondo: `radial-gradient(… #fff → rgba(--tinta,.20))`.
- Relieve: un `inset` de luz arriba, un anillo tintado y una sombra del color del ícono.
- Halo: un `::before` con `blur(22px)` que se enciende en hover. La card lleva `isolation: isolate`.
- Hover: el ícono hace `translateY(-5px) rotate(-5deg) scale(1.05)` con curva de rebote.

**Detalle del CTA final:**
- Alcancía de 120px a la izquierda, cohete de 110px a la derecha y estrella de 54px.
- El fondo suma un `radial-gradient` ámbar sutil arriba.
- En ≤900px quedan solo alcancía y cohete, a 64/60px en las esquinas.

**Qué no se tocó en la landing:**
- La corona `icon-premium` de los planes Premium, porque es un asset de marca.
- Los videos de escena de Pablo, que siguen siendo los protagonistas.

---

### Onboarding

Todos los íconos de opción pasaron al set 3D de Pablo. El sistema de tiles cerámicos de 8 tintas (`custom.css` §6.1) se mantiene igual.

| Pantalla | Opción → ícono |
|---|---|
| StepPrimer (objetivo) | gastos hormiga → hormiga (sin cambio) · ahorrar → alcancía · metas → diana · automatizar → ciclo · deudas → tarjeta · educación → birrete |
| Step6 (edad) | <18 → niño · 18–24 → birrete · 25–34 → laptop · 35–50 → casa · >50 → estrella |
| Step7 (experiencia) | primera vez → brote · app → celular · Excel → barras · manual → lápiz |
| Step9 / Step14 (claridad / flujo) | siempre / sí → alerta · a veces → carita confundida · bajo control → check · guardo una parte → escudo |
| Step11 (registro) | WhatsApp → chat · app → celular |
| Step12 / Step13 (deudas) | sí → tarjeta · no → check · hipoteca → casa · vehicular → carro · estudiantil → birrete · personal → monedas |
| Step15 (meta) | sí → diana · quiero empezar → brote · todavía no → calendario |
| Step16 (funciones) | WhatsApp → chat · presupuesto → dona · deuda → tarjeta · categorías → medidor · resumen → barras · metas → diana |
| StepPorque (motivo) | paz → corazón · fin de mes → calendario · algo importante → regalo · hábitos → brotes · familia → familia · otro → estrellas |
| StepFuente (cómo supiste) | amigos/familia → familia · noticias/blog → periódico · otra → estrellas (los logos de Google/TikTok/YouTube/IG/WhatsApp no cambian) |
| Step4 (demo) | Escribe → lápiz · Foto → cámara · Audio → micrófono |
| MetaAhorroCard | racha → fuego |
| **Step18B (paywall 2/2)** | Hoy → regalo · aviso → campana · cobro → calendario |

**Línea de tiempo del paywall (Step18B):**
- Los puntos de 14px pasan a tiles de 36px con `border-radius: 12px` y `corner-shape: squircle`, y el canto `--pab-drop-sm`.
- Tinta por hito: **Hoy** va en ámbar encendido (`#fff3d6`, borde `#f5a623`, anillo `0 0 0 4px rgba(245,166,35,.18)`). El aviso va en lila (`--cer-5`) y el cobro en esmeralda (`--cer-3`).
- La columna pasa a 36px y el hilo se corre a `left:17px; top:40px`.
- La pantalla sigue entrando completa en 390×844.

**Micro-interacción en todos los íconos de opción:**
- **Hover:** `translateY(-2px) rotate(-6deg) scale(1.08)` con `var(--ease-clay)`, solo en `@media (hover:hover)`.
- **Al seleccionar:** `iconoPop` de 0.5s (escala 1 → 1.22 → 0.96 → 1 con giro).
- **Movimiento reducido:** con `prefers-reduced-motion` no hay ninguna animación.

**Caché:** `OnboardingLayout.astro` pasa de `custom.css?v=43` a `?v=44`.

---

### Verificación

- `npm run build`: 25 páginas, sin errores. El 401 de Notion viene de la configuración local y no de estos cambios.
- `npm test`: 11/11.
- Revisión visual con Playwright a 1280px y a 375/390px: home, /planes y el onboarding (primer, 4, 6, 16, porque y 18b).
- Sin imágenes rotas y sin scroll horizontal.
