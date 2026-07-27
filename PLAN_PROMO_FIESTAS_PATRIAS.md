# Plan de optimización — página de oferta (Pablo Promo · Fiestas Patrias)

**Página:** `/fiestas-patrias` → componente `src/components/OfertaMillonaria.astro` (3.391 líneas)
**Fecha:** domingo 26-jul-2026 · **cierra:** miércoles 29-jul 11:59 p.m. (hora Perú)
**Quedan 3 días de venta y luego salen los correos masivos.**

Regla de este documento: **ninguna línea de copy es inventada.** Cada una lleva `[fuente: …]`
apuntando a dónde ya la escribiste tú o dónde la dijo un usuario en las entrevistas. Lo que no
tiene fuente está marcado `[PENDIENTE — lo escribes tú]` y no se publica hasta que exista.

---

## Estado de ejecución — dom 26-jul 18:30

**Ya aplicado en la rama `fiestas-patrias-v2` (build verificado, 23 páginas, sin errores):**

| Cambio | Archivos |
|---|---|
| ✅ Ruta `/planes` creada — redirige a `/#planes` (ya no es 404) | `src/pages/planes.astro` |
| ✅ "martes 29" → "miércoles 29" en toda la página, el paywall y el meta description | `OfertaMillonaria.astro:35,910`, `Step18.astro:48`, `fiestas-patrias.astro:12` |
| ✅ Carrusel de testimonios a 1,5 s por tarjeta (antes 2,6 s) | `TestimonialsCarousel.astro:138,183,190` |
| ✅ Bloque de precio simplificado a cartel de tienda: `S/.615` tachado · **S/.200** grande · `POR EL AÑO ENTERO · TIEMPO LIMITADO`. Eliminadas las dos versiones del comparativo de 3 columnas | `OfertaMillonaria.astro` (§incluye y §resumen) + CSS `.om-precio` |
| ✅ Valores del stack ajustados a números defendibles (ver decisión abajo) | `OfertaMillonaria.astro:46-140`, `Step18.astro:116` |

**Segunda tanda (hero nuevo + secciones nuevas):**

| Cambio | Detalle |
|---|---|
| ✅ Fuera el taller | Eliminada la barra "Última grabación disponible hasta el…" y el `<iframe>` de YouTube. La prop `heroVideoId` pasó a llamarse `promo` |
| ✅ Hero de la Pablo Promo | Carrusel vertical de 7 slides (Pablo + las 6 cosas) en una tarjeta con degradado lila: desliza hacia arriba cada 2,6 s, chip dorado con el nombre DENTRO de cada slide (nunca se desincroniza de la imagen) y puntitos de progreso al costado; el ítem del stack en pantalla se enciende en dorado. La vuelta usa un clon del primer slide para deslizar sin rebobinar. En móvil (150 px) el chip y los puntitos salen: la lista ya dice qué está en pantalla. Slides 2-7 se cargan con `requestIdleCallback`, no compiten con el primero. (27-jul: reemplazó al cross-fade de 2,2 s). Reparto del boceto de Rodrigo (27-jul, segunda ronda): cabecera (sello + headline + kicker) centrada a lo ancho, debajo carrusel a la izquierda con la lista + precio a la derecha, CTA y countdown centrados al final; el reparto en dos columnas entra desde 760 px (antes 900 px) |
| ✅ Cabe en una pantalla de 812 px | Medido: botón 638→690, reloj 698→744, fecha 752→771, garantías 779→797 |
| ✅ Un solo reloj | Antes había 4 countdowns con el mismo deadline |
| ✅ Sección **El Problema** | 4 citas verbatim de las entrevistas de Notion (Jackelyn, César, Stephany, Sonia) + el cierre de Marco. Sin precio y sin botón: solo baja la guardia |
| ✅ Sección **Qué es Pablo** | Titular del FAQ 1, los 4 bullets del plan, cita de Giovanna y el mock de `HeroPhone` (HTML/CSS, no imagen) |
| ✅ Barra fija verificada | Funciona con el selector nuevo `.om-hero--promo` |
| ✅ Subtítulo del stack corregido | "Son 6 cosas distintas, cada una con su propio valor. No es un paquete borroso" → "Un año de Pablo + el reto + el curso + La Komunidad + el toolkit". Lo primero dejó de ser cierto y sonaba a marketero |

**Corpus de voz levantado** (225 citas verbatim con fuente, en
`repos/pablo-landing-research/`): las 16 entrevistas de Notion, el messaging y
los ICP, los carruseles y blogs, los guiones de clases y webinar, y el copy
actual del repo. Más 4 análisis de la página (voz, confianza, Perú, UX móvil).

Hallazgos del corpus que cambian decisiones:
- **El churn #1 no es el precio: es no formar hábito** (9 de 10 de los que se
  fueron), y 9 de 10 se fueron en menos de un mes. El reto de 30 días ataca
  exactamente eso — es el bono correcto, no un relleno.
- **Churn involuntario por billing toca a ~6 de 10**: correo de registro
  perdido, tarjeta rechazada, suscripción vencida, cobro sin acceso por un bug.
  Eso no lo arregla la landing, pero explica por qué la base se contrae.
- **"Roche" no lo dijo ningún usuario** — solo aparece escrito por el equipo.
  Los usuarios dicen "vergüenza", "rechazo" y *"no quiero que otra me diga que
  estoy desordenada"*. El FAQ puede quedarse (es copy tuyo), pero el dolor real
  está en las palabras de ellos.
- **NPS alto no significa retención**: la propia síntesis avisa que varios 9 y
  10 se levantaron durante la demo en vivo de la entrevista. No usar el NPS
  como prueba social.
- **13 de 16 llegaron por tu contenido de Instagram.** La confianza en ti es lo
  que destraba el pago — razón de más para subir la carta y poner tu foto.
- *"No hay nada más rápido que un mensaje de WhatsApp"* es de **César
  Sabogal**, no de Alejandro (estaba mal atribuido en notas previas).

**Decisiones tomadas por Rodrigo (26-jul):**

- **Reto de 30 días → S/.0.** No lleva precio: no es un producto, es el reversor de riesgo.
  El seguimiento de la racha se hace **con la función de rachas que ya existe dentro de la app
  de Pablo** — con eso el reembolso pasa a ser auditable, que era el hueco.
- **Curso → S/.300.** Se mantiene el número. Listar el curso a S/.300 en `/cursos` para quien
  no es suscriptor queda **para el final**, después de la promo. Hasta entonces ese tachado es
  un precio que todavía no se ha cobrado nunca; está marcado con `⏳ PENDIENTE` en el código.
- **Toolkit → sin precio propio.** Vive **dentro de La Komunidad** y se explica en el correo.
  Cobrarlo aparte sería contar el mismo acceso dos veces.
- **La Komunidad → S/.75** (los $20 USD/mes reales de Skool).
- **Total por separado = S/.615** = 240 (12 × S/.20 del plan mensual real) + 300 (curso) + 75
  (un mes de La Komu).
- **Los correos NO apuntan a `/planes`**: van todos a la página oficial del evento.
  ⚠️ Falta que Rodrigo confirme la URL exacta y quién edita los 4 borradores de Brevo.
- **Se aprueba la simplificación de la página** (§3): seguir adelante con la reestructura.

**Falta desplegar.** Nada de esto está live hasta que Ryan redespliegue (Docker, no es
automático). Después del deploy, verificar `curl -o /dev/null -w "%{http_code}" https://www.usapablo.com/planes` → debe dar 200 o 301.

---

## 0. El diagnóstico en un párrafo

La página no está mal construida: está **sobre-construida**. Ya tiene todo el arsenal de
Hormozi (value stack, bonos con valor tachado, doble garantía, countdown, FAQ de objeciones,
downsell) y eso es justo el problema. Un limeño de 25 años que llega desde un correo se
encuentra 5 anuncios de deadline con 3 redacciones distintas, 4 relojes corriendo, 6 cifras
tachadas que nunca costaron eso, 10 botones que dicen 10 cosas distintas y el mismo carrusel de
testimonios tres veces. **Cada una de esas cosas por separado es una técnica; todas juntas son
un aviso de que le están vendiendo humo.** Lo único que la página tiene y que ninguna otra
puede copiar — tu carta de los Backyardigans, las frases crudas de tus usuarios, tu historia
de los S/.15.000 quemados a los 19 — está enterrado o directamente no está.

El trabajo de estos 3 días no es agregar. Es **quitar la mitad y poner adelante lo humano.**

---

## 1. EMERGENCIAS — antes de mandar un solo correo

### 1.1 🔴 El CTA de los correos apunta a un 404

```bash
curl -s -o /dev/null -w "%{http_code}" https://www.usapablo.com/planes   # → 404
curl -s -o /dev/null -w "%{http_code}" https://www.usapablo.com/fiestas-patrias/  # → 200
```

`/planes` **no existe**. Nunca existió como ruta: era el ancla `/#planes` del home.
Está en el CTA de estos correos de Brevo:

| # | Campaña | Estado | Destinatarios |
|---|---|---|---|
| 103 | Oferta Millonaria Lista #2 — *"quemé S/.15 000 a los 19"* | draft, creada hoy | **3.511** |
| 93 | Oferta Millonaria Usuarios #3 | draft | 282 |
| 92 | Oferta Millonaria Usuarios #2 | draft | 282 |
| 88 | Oferta Millonaria Registrados #2 | draft | 338 |
| 87 | Oferta Millonaria Lista #1 | **ya enviada** | 3.328 |
| 80 | Oferta Millonaria Registrados #1 | **ya enviada** | 349 |

Resultado de los dos ya enviados: **11 clics únicos entre 3.677 entregados (0,3 %)**, con
aperturas normales (14,7 % y 18,1 %). La gente abrió, quiso entrar y se topó con un 404.
No fue el copy: fue el link.

**Arreglo (5 minutos, y arregla los 6 correos de un golpe):** crear `src/pages/planes.astro`
con el mismo contenido que `fiestas-patrias.astro`. No hay que tocar ningún correo.

```astro
---
// /planes — la URL que usan todos los correos de la campaña. Mismo contenido
// que /fiestas-patrias para que los CTA ya escritos en Brevo funcionen.
import Layout from '../layouts/Layout.astro';
import Footer from '../components/Footer.astro';
import OfertaMillonaria from '../components/OfertaMillonaria.astro';
---
<Layout title="…" description="…" hideBanner hideMoneda noindex>
  <OfertaMillonaria />
  <Footer />
</Layout>
```

> Requiere redeploy (Docker, no es automático). **Es lo primero que tiene que salir hoy.**
> Después del deploy, verificar con `curl` que `/planes` responde 200 antes de que Rodrigo
> apriete enviar.

### 1.2 🔴 El deadline está escrito con el día equivocado

La página dice **"martes 29 de julio"** en 5 lugares. **El 29 de julio de 2026 es miércoles.**

```
2026-07-23 → Thursday   (el webinar, correcto)
2026-07-28 → Tuesday
2026-07-29 → Wednesday  ← el deadline
```

En el webinar en vivo dijiste *"se cierra el miércoles 29 de julio"* — eso estaba bien. Lo que
está mal es el código y los correos. Alguien que revisa su calendario ve un error y descuenta
todo lo demás de la página.

Líneas a corregir en `OfertaMillonaria.astro` (todas salen de una sola constante, L35):

| Línea | Hoy | Debe decir |
|---|---|---|
| 35 | `DEADLINE_TEXTO = "martes 29 de julio"` | `"miércoles 29 de julio"` |
| 265 | "Última grabación disponible hasta el martes 29 de julio" | *(esta barra se elimina, §3.1)* |
| 331-333 | "Cierra el martes 29 de julio a las 11:59 p.m." | "miércoles" |
| 838 | "La oferta cierra el martes 29 de julio a las 11:59 p.m. (hora Perú)" | "miércoles" |
| 915-918 | "Solo hasta el martes 29 de julio" / "Después del martes 29…" | "miércoles" |
| `fiestas-patrias.astro:13` | meta description "Solo hasta el martes 29 de julio" | "miércoles" |

Y hay que **corregirlo también en los borradores de Brevo** #103, #93, #92, #88 (los 4 dicen
"martes 29").

### 1.3 🟠 El deadline vive en dos sitios que no se hablan

`OfertaMillonaria.astro:34` tiene `DEADLINE_ISO` a mano, y `siteConfig.ts:39` tiene
`ofertaFinISO`. Si mañana cambias uno, el otro no se mueve. Además **no hay estado post-cierre**:
el 30 de julio a las 00:01 los 4 relojes se quedan clavados en `00:00:00:00` y la oferta sigue
comprable, con los bonos y todo. Eso convierte tu urgencia en mentira retroactiva para
cualquiera que vuelva a entrar.

**Arreglo:** que el componente lea `PROMO_MILLONARIA.ofertaFinISO` de `siteConfig` (una sola
fuente de verdad) y que al vencer muestre un estado cerrado: se oculta el stack de bonos y
queda solo el plan anual a precio normal + el mensual. 30 minutos de trabajo, y te deja lista
la reapertura del viernes 31 que ya tienes planeada (que **hoy es imposible**: la config apaga
todo el 30-jul a las 00:00 y el deploy no es automático).

### 1.4 🟠 Dos bonos no tienen entregable

El FAQ promete: *"Apenas compras, te llegan por correo los accesos a todo: el reto, el curso,
La Komunidad y el toolkit."*

| Bono | Estado real |
|---|---|
| Curso "Finanzas de un Futuro Millonario" | ✅ **existe** — 4 sesiones con video real, `/cursos/` responde 200 |
| Pase a La Komunidad | ✅ existe (Skool) |
| Garantía 14 días | ✅ política, se ejecuta a mano |
| **Reto "Camino al Millón 30 días"** | ⚠️ **no existe como entregable** — no hay página, no hay tracking de racha, y su link apunta al mismo `/cursos/` |
| **Toolkit Komunitario (+10 recursos)** | ⚠️ las 5 carpetas locales están **vacías** |

El reto es el bono #1 y es el que sostiene toda la promesa de "te sale gratis" y el reembolso
del 100 %. Si alguien paga y no le llega, no es un bono flojo: es un pedido de devolución con
razón. **Y no hay forma de auditar quién cumplió la racha de 30 días**, así que tampoco puedes
defender un "no cumpliste".

Esto no lo arregla el copy. Decisión tuya en §5.

---

## 2. Veredicto sobre el documento de Hormozi

Lo mejor que tiene ese documento es la **arquitectura de decisión** (qué necesita saber alguien
para decidir, y en qué orden). Lo peor es que está calibrado para un mercado donde el value
stack con precios inventados es folclore aceptado. En Perú eso te cuesta la venta, y en varios
casos choca de frente con reglas de voz que tú mismo escribiste.

| Punto de Hormozi | Veredicto | Por qué |
|---|---|---|
| Hero con resultado + producto en acción + 1 CTA | **ADOPTAR** | Es exactamente lo que falta hoy: arriba hay un video de YouTube borroso y ni aparece la palabra WhatsApp |
| "Muestra el producto en acción, no logos bonitos" | **ADOPTAR** | Tu página no tiene una sola captura real. Todo es la mascota ilustrada |
| CTA único, misma etiqueta | **ADOPTAR** | Hoy hay 10 etiquetas distintas para el mismo botón |
| Sección "el problema" antes de la solución | **ADOPTAR** | Falta por completo, y es lo que baja la guardia |
| FAQ que ataca objeciones | **YA LO TIENES, mejor que él** | Tus 10 preguntas son mejores que las 5 genéricas que propone. No tocar |
| Garantía explícita | **YA LO TIENES ×2** | Lo que falta no es la garantía, son las condiciones precisas |
| La metáfora de **"la cubeta rota"** | **DESCARTAR** | "balde/cubeta/buckets" está en tu lista de palabras prohibidas: la metáfora aprobada es **"3 cajones"**. Y ya tienes una imagen propia mucho mejor: *"el tsunami moderno de gastos hormigas y ansiedad financiera"* [fuente: carta de la página, L765] |
| Value stack con "valor de referencia" por bono | **ADAPTAR, con cuidado** | Ver §5.2. Dos de los cuatro números nunca se cobraron |
| "S/.200 **al mes**" (lo dice dos veces) | **ERROR SUYO** | Es S/.200 **al año**. Si eso se publica así, cada persona que entre cree que le van a cobrar S/.2.400 |
| "+[X] jóvenes ya usan a Pablo para dejar de perder **hasta 30 % de su sueldo**" | **DESCARTAR** | Ese 30-40 % es de **un** testimonio (Eduardo S.), no un promedio medido. Convertirlo en dato de base es exactamente el claim que te hunde |
| Tabla comparativa mensual vs anual | **ADAPTAR** | Ya tienes el downsell al final y funciona mejor: la tabla en medio de la página invita a elegir el barato |
| "deja de sentir culpa" como promesa | **DESCARTAR** | Tu voz no dice "deja de sentir culpa"; tus usuarios dicen *"A veces ni quiero mirar mis gastos, me da ansiedad"*. Se usa la frase del usuario, no la etiqueta del marketero |
| "te habla como amigo, no como banco" | **ADAPTAR** | La idea sí (es tu posicionamiento: *cercano, simple, humano, peruano*), la frase no. Tú ya tienes: *"sin palabreo de banco ni fórmulas raras"* [fuente: L96 de la página] |
| Testimonios con foto y nombre | **ADOPTAR** | Hoy no hay una sola foto. Es el hueco de confianza más grande |
| Bloque de números ("+X usuarios", "S/.Y ahorrados") | **CONDICIONAL** | Solo si el número se puede sostener hoy. Ver §6 |

---

## 3. La página nueva — orden final

Tu dirección: quitar el taller, hero con el loop de Pablo + los bonos + el offer stack, y
después **alternar sección informativa (que no pide nada) → sección de venta (con el dolor y
el CTA)**. Estoy de acuerdo con el ritmo. Un ajuste que te propongo: aplicarlo a **3 bloques,
no a 6**.

Seis bonos × 2 secciones = 12 pantallas antes del cierre, sumado a hero, testimonios,
garantías, FAQ y downsell son ~20 secciones en un celular. Se cae por peso. Lo que carga la
decisión son el **Plan Anual, el Reto y el Curso**; Komunidad + Toolkit + Garantía se agrupan
en un bloque (son buenos, pero nadie compra por el toolkit).

```
 1. HERO — loop Pablo ↔ bonos + offer stack + Desbloquea a Pablo        [reescribir]
 2. EL PROBLEMA — dolor, sin vender nada                                 [NUEVO]
 3. QUÉ ES PABLO — el puente para quien no te conoce                     [NUEVO]
 4. TESTIMONIOS — el carrusel del home, rápido                           [mover arriba + acelerar]
 5. INFO: Plan Anual — todo lo que hace, sin pedir nada                  [reescribir]
 6. VENTA: titular + dolor + subtexto + CTA                              [NUEVO]
 7. INFO: el Reto de 30 días — cómo recuperas tu plata                   [reescribir]
 8. VENTA: titular + dolor + subtexto + CTA                              [NUEVO]
 9. INFO: el Curso — las 4 sesiones, con captura real                    [reescribir]
10. VENTA: titular + dolor + subtexto + CTA                              [NUEVO]
11. INFO: Komunidad + Toolkit + Garantía (los tres juntos)               [fusionar 3 en 1]
12. LA CARTA — "¿Por qué se llama Pablo?"                                [mantener, subir]
13. EL RESUMEN — 527 tachado / 200 grande / tiempo limitado              [simplificar]
14. GARANTÍAS — las condiciones exactas, sin adornos                     [reescribir]
15. FAQ — las 10 que ya tienes                                           [no tocar]
16. CIERRE — última llamada + CTA                                        [mantener]
17. DOWNSELL — mensual S/.20 con 14 días                                 [mantener]
```

**Se eliminan:** la barra de "última grabación", el hero de video, las 6 hojas de bono a 82vh
con CTA cada una, el bloque comparativo `527→200→0` duplicado, la sección de urgencia con el
cuarto reloj, y ~500 líneas de CSS huérfano.

Ganancia: la página pasa de ~20 pantallas a ~14, de 4 relojes a 1, de 10 etiquetas de CTA a 1.

---

## 4. Sección por sección

### 4.1 HERO — reemplaza el taller

**Fuera:** la barra navy de "Última grabación disponible hasta el martes 29 de julio" (L250-269)
y el `<iframe>` de YouTube (L300-310). Ese iframe es el peor elemento de la página: la
miniatura es una slide ilegible, pesa antes que cualquier texto y su botón **"Mirar en
YouTube" se lleva a la persona fuera del sitio**.

**Entra:** el loop infinito. Un solo cuadro que rota `00-pablo → 01-plan-anual → 02-reto →
03-curso → 04-komunidad → 05-toolkit → 06-garantia` y vuelve a empezar, con el nombre de cada
cosa apareciendo debajo del cuadro mientras se muestra. Los 7 archivos van en
`public/promo/00-hero/` (ver `_LEEME.md`).

- Cadencia: **2,2 s por frame**, cross-fade de 400 ms. Más rápido no se alcanza a leer la
  etiqueta; más lento y no se ve que hay 7 cosas.
- Al costado (debajo en móvil): la lista de las 6 cosas en texto, con la que está en pantalla
  resaltada en dorado. Así en 15 segundos la persona ve el paquete completo **sin scrollear**.
- Acento dorado: `--gradient-cta` ya existe (`#F6B72B → #FBAB21 → #FEA41B`). Se usa para el
  ítem activo, el botón y el precio. **En nada más.** El dorado solo dirige si es escaso.
- **Sin autoplay de video, sin nada que salga del sitio.**

**Copy (todo con fuente):**

| Elemento | Copy | Fuente |
|---|---|---|
| Eyebrow | `Pablo Promo · Fiestas Patrias` | nombre de tu campaña (`project_pablo_es_peruano`, "F2 Pablo Promos") |
| H1 | `Este año sí. Y si haces tu parte, te sale gratis.` | ya es tu H2 del cierre, `OfertaMillonaria.astro:911` |
| Subtítulo | `Un año entero de Pablo, tu asistente financiero en WhatsApp, por S/.200. 12 meses al precio de 10.` | "12 meses al precio de 10" — guion 4 Mandamientos L297 + tarjeta del plan L57 |
| Línea de urgencia | `Últimos días: cierra el miércoles 29 a las 11:59 p.m.` | corrección de L331 |
| Precio | `~~S/.615~~` chico y tachado · `S/.200` gigante · `POR EL AÑO ENTERO · TIEMPO LIMITADO` | tu instrucción directa |
| CTA | `Desbloquea a Pablo` → `/onboarding?plan=anual&oferta=millonaria` | `siteConfig.ts:57`, es la etiqueta oficial del sitio |
| Bajo el botón | `Garantía de 14 días · cancelas cuando quieras` | L337-339 (se quita el tercer ítem para no repetir el reembolso acá) |

Un solo reloj en toda la página, y va acá.

> Nota sobre el precio: la línea `S/.527 en bonos → hoy S/.200 por el año entero → S/.0 si
> completas el reto` se elimina de las dos veces que aparece (L498-513 y L698-714). Tenías
> razón: se lee como una hoja de cálculo. Queda tachado + número grande + "tiempo limitado",
> como un cartel de tienda.

### 4.2 EL PROBLEMA — nueva, y es la más importante

Es la sección que baja la guardia. No vende, no menciona el precio, no tiene botón. Solo hace
que la persona piense *"esto me pasa a mí"*. Todo el copy son frases textuales de tus
entrevistas y de tus propios correos.

| Elemento | Copy | Fuente |
|---|---|---|
| H2 | `No necesitas ganar ni un sol más para estar tranquilo con tu plata. Solo necesitas verla.` | tu Big Domino del webinar, guion L12 |
| Bajada | `Lo que no ves, no lo puedes controlar.` | ancla de campaña, `campana_oferta_millonaria.md` |
| Cita 1 | `"Empiezo motivada, pero a las dos semanas me olvido de anotar."` | entrevista, `brand-context.md` L47-50 |
| Cita 2 | `"Sé que debería registrar, pero me da flojera abrir una app solo para eso."` | ídem |
| Cita 3 | `"A veces ni quiero mirar mis gastos, me da ansiedad."` | ídem |
| Cita 4 | `"No me falta información, me falta motivación."` | ídem |
| Cierre | `"Ya el primer día con un retraso, el segundo un poco más, ya el tercer día se volvió tedioso… poquito a poquito fui soltándolo."` — Marco | guion L158 (usuario churned: se usa como dolor compartido, **nunca** como testimonio de éxito) |

Las 4 citas van como frases sueltas grandes, tipo letra a mano, no como tarjetas de testimonio
(no son testimonios: son el dolor). Sin foto, sin nombre completo.

**Cero visual nuevo necesario.** Y es la sección que más va a hacer por la conversión.

### 4.3 QUÉ ES PABLO — el puente que hoy falta

3.511 de los 3.511 destinatarios del correo #103 salen de la lista general. La mayoría **no
fue al webinar y no sabe qué es Pablo.** Hoy la página nunca lo explica: arranca vendiendo un
paquete de una cosa que no presentó.

| Elemento | Copy | Fuente |
|---|---|---|
| H2 | `Pablo es tu hoja de Excel, pero en tu WhatsApp.` | frase textual de Marco, usuario, guion L202 |
| Bajada | `Le mandas un mensaje, un audio o la foto del yape y él lo registra. Sin fórmulas, sin abrir otra app.` | bullets del plan L64-66 + FAQ 1 |
| Bullet 1 | `Registra tus gastos por texto, audio o foto del yape — en lo que tardas en mandar un WhatsApp.` | L64 |
| Bullet 2 | `Presupuesto de 3 cajones: lo esencial, tu futuro y tus gustos.` | L66 (metáfora aprobada — **nunca** "baldes") |
| Bullet 3 | `Metas de ahorro para que tu plata tenga destino.` | L67 |
| Bullet 4 | `Panel web para ver todo de un vistazo.` | L68 |
| Cita | `"no hay nada más rápido que un mensaje de WhatsApp"` — Alejandro | guion, entrevista |

**Visual:** acá va la captura real del chat + el panel (`public/promo/01-plan-anual/`). Si no
llega a tiempo, el mock de `HeroPhone.astro` ya existe y es reutilizable — es HTML/CSS puro,
no imagen, así que se ve nítido en cualquier pantalla.

⚠️ **No incluir "Pablo te manda recordatorios"**: el canal de notificaciones de WhatsApp no
está live (guion L224). Está prometido en el home ahora mismo (`Features.astro:48`) y eso hay
que corregir aparte.

### 4.4 TESTIMONIOS — el carrusel del home, más rápido

Buena noticia: **ya es el mismo componente** (`TestimonialsCarousel.astro`, montado en L785).
Lo único que falta es velocidad, y sube en el orden: la prueba social tiene que llegar antes
de la primera pedida de plata, no después.

Cambios en `TestimonialsCarousel.astro`:

| Línea | Hoy | Nuevo (aplicado) |
|---|---|---|
| 190 | `}, 2600);` | `}, 1500);` |
| 138 | `transform 0.7s cubic-bezier(...)` | `transform 0.5s cubic-bezier(...)` |
| 183 | `}, 750);` | `}, 550);` (tiene que ser menor que el intervalo) |

> **Un tradeoff que te debo decir:** a 1,5 s por tarjeta el movimiento se siente vivo, pero
> varios de tus testimonios tienen 2 y 3 líneas y **nadie los va a alcanzar a leer**. Si
> quieres el ritmo de uno por segundo, hay que recortar los textos a ~12 palabras para que
> entren de una mirada. Los que ya funcionan a esa velocidad: *"Pablo me cambia la vida, la
> verdad."*, *"Con Pablito ya saqué mi promedio en taxis 🚕 y me quiero morir jajaja"*, *"Si
> Pablo desapareciera, lo que más extrañaría es la visibilidad de todo."* Los de Eduardo,
> Gabriela y Lady necesitan tijera. El recorte lo tienes que aprobar tú porque son palabras de
> otras personas.

Y **arreglar la inconsistencia de atribución**, que hoy es un problema de credibilidad real:
la misma persona aparece como `Daniel · 25 años · ingeniero civil` en un bloque y como
`Daniel V. · Usuario de Pablo` en el carrusel. Se elige una sola forma —
**nombre + edad + ocupación**, que es la más creíble — y se usa igual en todos lados. Ojo con
`Rodrigo P. · 39 años · entrenador`: se confunde contigo. Hay que dejar claro que es un usuario.

### 4.5 Los bloques INFO → VENTA

El patrón que pediste, para los 3 bloques que cargan la decisión.

**Sección INFO:** explica y emociona. Titular descriptivo, el visual grande de
`public/promo/NN-*/principal.png`, y lo que incluye por partes. **Sin precio y sin botón.**

**Sección VENTA (la siguiente):** titular + subtítulo de dolor + subtexto + CTA. El subtítulo
es el dolor, textual del usuario. Estos son los que tengo con fuente:

#### Bloque 1 — Plan Anual

- **INFO** · H2: `Un año entero de Pablo` · lo que hace (los 4 bullets de §4.3) · visual
  `01-plan-anual/principal.png` + captura del panel.
- **VENTA** · H2: `Este año sí.` [L911]
  Subtítulo (dolor): `"Pensar en el futuro me estresa, no sé si voy a poder ahorrar."` [ICP
  Mariella, `brief_pablo_es_peruano.md` L21-33]
  Subtexto: `S/.200 por los 12 meses. Menos de 55 céntimos al día.` [FAQ 4, L~220]
  CTA: `Desbloquea a Pablo`

#### Bloque 2 — El Reto de 30 días

- **INFO** · H2: `El reto que te devuelve tu plata` · las 4 condiciones **completas y
  visibles** (racha de 30 días registrando · presupuesto mensual definido · primer aporte a una
  meta · curso completado) [L79-84] · visual `02-reto/principal.png`.
  → Acá hay que arreglar algo: el FAQ 6 dice *"Las condiciones del reto son 4 y están escritas
  arriba"* pero **la sección que las listaba fue borrada del markup**. Hoy la promesa remite a
  un bloque que no existe. Esta sección lo repara.
- **VENTA** · H2: `Y si haces tu parte, te sale gratis.` [L911]
  Subtítulo (dolor): `"Ya el primer día con un retraso, el segundo un poco más… poquito a poquito fui soltándolo."` [Marco, guion L158]
  Subtexto: `Haz tu parte durante 30 días y te devolvemos todo lo pagado. Ganas el hábito y recuperas tu plata.` [L820]
  CTA: `Desbloquea a Pablo`

#### Bloque 3 — El Curso

- **INFO** · H2: `Finanzas de un Futuro Millonario` · las 4 sesiones con sus nombres reales
  (Ahorro · Presupuesto · Metas · Deudas) [`src/lib/cursos.ts`] · **captura real de la
  plataforma** — es lo que prueba que existe · visual `03-curso/`.
- **VENTA** · H2: `Para entender tu plata, no solo anotarla.` [PENDIENTE — lo escribes tú]
  Subtítulo (dolor): `"No me falta información, me falta motivación."` [entrevista, `brand-context.md`]
  Subtexto: `El curso de finanzas personales para entender tu plata sin palabreo de banco ni fórmulas raras.` [L96]
  CTA: `Desbloquea a Pablo`

#### Bloque 4 — Komunidad + Toolkit + Garantía (informativo, uno solo)

Tres tarjetas en una sección, con su copy actual [L104-134], y **un** CTA al final.

### 4.6 LA CARTA — sube, y se le corrigen 3 erratas

Es el activo más valioso de la página y hoy está en el puesto 8, después de que ya le pediste
plata 8 veces. Sube al puesto 12 (antes del resumen y del cierre): ahí es donde la persona ya
entendió la oferta y necesita saber quién está detrás.

Tiene 3 errores que le quitan justo lo que aporta:

| Hoy | Debe decir |
|---|---|
| "desembarcaban en diversas diferentes experiencias" | "desembarcaban en diferentes experiencias" |
| "los avances científicos y **técnologicos**" | "tecnológicos" |
| "el **problemas** es que si no lo practicas" | "el problema es que si no lo practicas" |

**Todo lo demás no se toca.** Las minúsculas se quedan, el 💛 se queda, el ritmo se queda. Esos
tres son errores de tipeo, no estilo: el estilo es lo que hace que suene a ti.

Falta una cosa: **tu foto.** Hoy la firma dice "Rodrigo · Papá de Pablo · @rodrigo.al.millon"
al lado de una ilustración de la mascota — y en el código el `alt` de la imagen de Pablo dice
"Rodrigo, papá de Pablo" (L477 y L618). Una foto tuya de verdad vale más que toda la sección
de garantías.

### 4.7 GARANTÍAS — el reversor tiene que ser auditable

Hoy la garantía aparece en 5 lugares con 5 redacciones distintas. Se consolida en una sola
sección, con las condiciones exactas y **enlace a los términos**:

- Red #1 · `Pruébalo 2 semanas. Si sientes que no es para ti, te devolvemos tu plata. Sin preguntas.` [L806]
- Red #2 · las 4 condiciones del reto, listadas, + cómo se pide, a quién se le escribe y en
  cuánto tiempo llega la devolución. **Eso último hoy no está escrito en ninguna parte** y es
  lo primero que pregunta alguien que ya se quemó con una suscripción.

Y hay que ser honesto con lo que ya decidiste: la renovación del anual en Stripe **sí** se
renueva; el copy aprobado es *"cancelas la renovación cuando quieras"*, no *"sin renovaciones
automáticas"* [`campana_oferta_millonaria.md` L307]. El FAQ 7 ya lo dice bien. No cambiarlo.

### 4.8 Lo que se elimina

| Qué | Líneas | Por qué |
|---|---|---|
| Barra "última grabación" | 250-269 | El taller terminó. Confunde a quien no fue |
| Hero con iframe de YouTube | 300-310 | Se lleva la gente fuera del sitio, miniatura ilegible, bloquea el render |
| 6 hojas de bono a 82vh con CTA propio | 548-649 | ~5 pantallas de scroll y 6 etiquetas de CTA distintas. Se reemplazan por §4.5 |
| Bloque `527 → 200 → 0` duplicado | 498-513 y 698-714 | Tu instrucción. Queda una versión simple |
| Sección de urgencia con el 4º reloj | 831-864 | El deadline ya está en el hero y en el cierre. Tres veces es amenaza |
| CSS huérfano | ~500 líneas | `.om-reto*`, `.om-paso*`, `.om-stack*`, `.om-item*`, `.om-test__grid`, `.om-social__chips`, `.om-carta__pin`, `.om-hero__video-badge`… todos sin markup |
| Fuente `Caveat` | 245-248 | Se descarga y no se usa (su regla está sobrescrita) |
| Datos muertos en el frontmatter | 143-161 | `pasosPacto` y `pactoPills` declarados y nunca renderizados |

Y en el `<head>`: `og:url` está hardcodeado al home, `og:image` es el logo, `twitter:card` es
`summary` (imagen chica) y el `canonical` de **todas** las páginas apunta al home. Cuando
alguien comparta el link por WhatsApp — que es como se comparte en Perú — va a salir un
cuadradito con el logo. Hay que poner una creatividad de la promo como `og:image` y
`twitter:card: summary_large_image`.

---

## 5. Decisiones que solo tú puedes tomar

### 5.1 El Reto y el Toolkit no tienen entregable
Tres caminos, de más honesto a más rápido:
1. **Producir lo mínimo en 3 días**: una página `/reto` con las 4 condiciones, cómo se registra
   la racha y cómo se pide el reembolso; y subir aunque sean 5 recursos reales al toolkit.
2. **Reencuadrar**: el reto pasa de "bono con valor S/.97" a "cómo funciona la garantía" (que
   es lo que realmente es), y el toolkit sale del stack hasta que exista.
3. **Dejarlo como está** y asumir los pedidos de devolución de quien no reciba lo prometido.

Mi recomendación es la 1 para el reto (es el corazón de la oferta) y la 2 para el toolkit.

### 5.2 Los valores del stack — RESUELTO
El S/.527 se reemplazó por **S/.615**, y cada línea quedó así:

| Ítem | Valor | ¿Se sostiene? |
|---|---|---|
| Plan Anual (12 meses) | S/.240 | ✅ es 12 × S/.20, el precio mensual real. Aritmética verificable |
| Curso | S/.300 | ⏳ pendiente de listarlo a ese precio en `/cursos` (queda para después de la promo) |
| Komunidad | S/.75 | ✅ los $20 USD/mes reales de Skool |
| Reto | S/.0 | ✅ no es producto, es el reversor de riesgo |
| Toolkit | — | ✅ va dentro de La Komunidad, no se cobra aparte |
| Garantía | — | ✅ no es producto |

**Queda una deuda abierta:** hasta que el curso esté listado a S/.300 en `/cursos`, ese tachado
es el único número del stack que no se puede verificar. Está marcado con `⏳ PENDIENTE` en el
código para que no se olvide. Es media hora de trabajo y cierra el último hueco.

### 5.3 ¿Qué número de usuarios se puede publicar?
El último dato firme es **222 pagados activos de Pablo al 25-jun** (119 mensuales + 103
anuales), 285 sumando La Komu, con la base contrayéndose (247 → 222 en junio). Hoy es 26-jul:
**no sé el número de hoy y no voy a publicar uno que no esté verificado.** Si quieres poner
prueba social numérica, hay que sacar el conteo de Stripe hoy. Con 222 la redacción segura es
*"más de 200 personas pagan por Pablo"*. Si hoy está por debajo de 200, no se pone número y se
usan los testimonios, que ya son fuertes.

Lo que **no** se puede publicar: el 30-40 % de gastos hormiga como promedio (es un testimonio),
el "87 % menos gastos hormiga" del asunto #71 (no tiene fuente en ningún archivo), ni el NPS
9,2 sin decir que es sobre 15 entrevistas.

### 5.4 El teléfono de soporte
Sigue sin resolverse: el texto visible decía **+51 986 581 912** y el href apuntaba a
**51904097278**, y el número de Pablo cambió a **+51 980 861 974**. Alguien que va a pagar
S/.200 y quiere hablar con un humano antes es exactamente el que compra. Tienes que decirme
cuál es el bueno.

---

## 6. Medición para estos 3 días

Hoy no hay forma de saber dónde se cae la gente: no hay scroll depth, no hay `section_viewed`,
**los 6 CTA de bono mandan el mismo `location:'bono'`** (indistinguibles) y no hay
`InitiateCheckout` estándar de Meta (solo `trackCustom`). Con el volumen de estos 3 días, sin
esto vas a ciegas.

Mínimo, siguiendo la convención que ya usas (`millonaria_cta_clicked`):

- `millonaria_seccion_vista` con `{seccion}` — un `IntersectionObserver` por sección
- `millonaria_cta_clicked` con `{location}` único por bloque: `hero`, `venta_anual`,
  `venta_reto`, `venta_curso`, `resumen`, `final`, `sticky`
- `millonaria_faq_abierta` con `{pregunta}` — te dice qué objeción pesa
- `fbq('track','InitiateCheckout')` además del `trackCustom`, para que el pixel optimice
- Y lo más importante: **verificar que `/planes` responde 200 antes de enviar.**

---

## 7. Lo que NO hay que tocar

- **Las 10 preguntas del FAQ.** Son mejores que cualquier cosa que yo pueda proponer y están
  escritas en tu voz. "Me da roche escribirle a un bot", "S/.200 de golpe es un montón para mí",
  "Ya me quemé con otras suscripciones" — eso es escuchar a la gente, no adivinar.
- **La carta de los Backyardigans**, salvo las 3 erratas. Es lo único de la página que nadie
  puede copiar.
- **"Sin cupos falsos ni relojes que se reinician"** [L842]. Es la frase más valiosa de la
  página para el eje de confianza. Se mantiene, y ahora además es verdad porque queda un solo
  reloj.
- **El downsell del mensual**, incluida la línea honesta *"Y al año te sale S/.240, no S/.200"*.
  Restar credibilidad a tu propia opción barata es exactamente lo que genera confianza.
- **El FAQ 7 sobre la renovación.** Está redactado con la verdad y así se queda.
- **El presupuesto de "3 cajones".** Nunca "baldes", nunca "buckets", nunca "cubetas".

---

## 8. Orden de ejecución

| # | Qué | Tiempo | Riesgo |
|---|---|---|---|
| 1 | Crear `/planes` + redeploy + verificar 200 | 15 min | ninguno |
| 2 | "martes" → "miércoles" (5 sitios + 4 correos de Brevo) | 15 min | ninguno |
| 3 | Acelerar el carrusel y subirlo de posición | 15 min | ninguno |
| 4 | Simplificar el bloque de precio (527/200/tiempo limitado) | 20 min | ninguno |
| 5 | Quitar barra del taller + hero de video → loop de Pablo | 2 h | necesita los 7 visuales |
| 6 | Nuevas secciones El Problema y Qué es Pablo | 2 h | copy ya listo y con fuente |
| 7 | Reestructurar bonos a INFO → VENTA | 3 h | necesita visuales por bono |
| 8 | Deadline desde `siteConfig` + estado post-cierre | 30 min | ninguno |
| 9 | Consolidar garantías + condiciones del reembolso | 45 min | decisión 5.1 |
| 10 | Eventos de PostHog | 45 min | ninguno |
| 11 | Limpiar CSS huérfano y datos muertos | 1 h | hacer al final |

Del 1 al 4 son **una hora en total, cero riesgo y sin depender de nada**. Si hoy no se hiciera
nada más, eso solo ya cambia el resultado de la campaña — sobre todo el 1.
