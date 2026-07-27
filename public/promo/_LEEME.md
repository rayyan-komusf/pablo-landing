# Visuales de la Pablo Promo — Fiestas Patrias

Acá van las imágenes de la página de oferta (`/fiestas-patrias`, y `/planes` cuando se cree).
Todo lo que pongas en `public/promo/...` queda servido tal cual en
`https://www.usapablo.com/promo/...` — no hay paso de build, basta con dejar el archivo acá.

## Reglas para todos los archivos

- **Nombres**: minúsculas, sin espacios, sin tildes, con guiones. `plan-anual.png`, no `Plan Anual.PNG`.
- **Formato**: `.png` si necesita transparencia, `.webp` si es una foto o captura (pesa menos).
- **Peso**: máximo 300 KB por imagen. La mayoría del tráfico entra con datos móviles.
- **Nada de texto quemado dentro de la imagen.** El texto va en HTML: así se lee en cualquier
  pantalla, se puede corregir en un minuto y no se ve pixeleado en el celular.
  Si una imagen necesita una etiqueta, mándala sin la etiqueta y la ponemos encima con código.
- **Pablo tiene que ser Pablo**: robot crema cabezón, casco marrón integrado, emblema swirl/zigzag.
  Sale de los renders oficiales de la librería, no generado de cero.

---

## `00-hero/` — el loop de arriba

El hero rota en loop infinito: primero Pablo, después cada cosa que entra en la promo, y vuelve
a empezar. Al costado va el resumen de la oferta y el botón **Desbloquea a Pablo**.

Necesito **7 archivos**, todos con el mismo encuadre para que el loop no salte:

| Archivo | Qué muestra |
|---|---|
| `00-pablo.png` | Pablo solo, de cuerpo entero, en su pose más simpática. Es el primer frame: lo que ve la persona al llegar. |
| `01-plan-anual.png` | Pablo + la señal de que es el año completo (calendario, 12, lo que decidas) |
| `02-reto.png` | El reto de 30 días |
| `03-curso.png` | El curso |
| `04-komunidad.png` | La Komunidad |
| `05-toolkit.png` | El toolkit |
| `06-garantia.png` | La garantía |

- **Medida**: cuadrado, 1200 × 1200 px.
- **Fondo transparente** (así el degradado morado de la página respira detrás y el loop no
  se ve como 7 cuadros pegados).
- Que el objeto ocupe más o menos el mismo alto en los 7. Si en uno Pablo sale chiquito y en
  otro gigante, el loop parpadea.

---

## `01-plan-anual/` … `06-garantia/` — las secciones de cada cosa

Cada bono tiene **dos secciones seguidas** en la página:

1. Una **sección informativa** que solo explica y emociona. No pide comprar.
2. Después, una **sección de venta** con titular, el dolor, el subtexto y el botón.

Los visuales son para la sección informativa. Por carpeta:

| Archivo | Para qué | Medida |
|---|---|---|
| `principal.png` | La imagen grande de la sección. Obligatoria. | 1600 × 1200 px (4:3) |
| `detalle-1.png`, `detalle-2.png`, `detalle-3.png` | Opcionales. Para mostrar por partes lo que incluye (ej. las 4 clases del curso, 3 recursos del toolkit). | 800 × 800 px |
| `captura.webp` | Si hay pantalla real que mostrar (el panel web, un chat con Pablo, la plataforma del curso). Captura de verdad, no dibujo. | ancho libre, mínimo 1200 px |

### Qué conviene mostrar en cada una

- **`01-plan-anual/`** — Pablo trabajando: el chat de WhatsApp registrando un gasto y el panel
  con el presupuesto de 3 cajones. Es lo único que la persona realmente compra, así que acá va
  el mejor visual de toda la página.
- **`02-reto/`** — los 30 días: la racha, el calendario marcándose, la plata volviendo.
- **`03-curso/`** — las 4 sesiones (Ahorro, Presupuesto, Metas, Deudas). Una captura real de la
  plataforma sirve más que una ilustración: prueba que existe.
- **`04-komunidad/`** — gente en la clase en vivo. Una captura real de una sesión con las
  caritas de la gente vale por diez ilustraciones.
- **`05-toolkit/`** — los recursos abiertos, que se vean las plantillas.
- **`06-garantia/`** — Pablo tranquilo. Acá no hace falta gran producción.

---

## Si falta algo

Cualquier hueco de esta carpeta se rellena con lo que ya existe en
`public/onboarding/images/pablo/` (los 6 PNG de Pablo con expresiones). No se queda un espacio
en blanco, pero se nota: son ilustraciones genéricas y no prueban nada.

**Lo que más levanta la conversión de esta carpeta son las capturas reales** — del curso, de la
clase en vivo y del panel. Eso es lo único que le demuestra a alguien que llega desconfiado que
lo que le están vendiendo existe de verdad.
