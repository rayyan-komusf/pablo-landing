# Brief · 5 animaciones de escena para la landing de Pablo

**Para:** el agente que produzca las animaciones con Higgsfield
**Entregable:** 5 videos **WebM VP9 con canal alfa**, listos para caer en la web
**Fecha:** 19-ago-2026

---

## 0 · Lo que ya se intentó y por qué falló

Se armaron estas escenas con primitivas CSS (una cama hecha de divs, monedas
marchando, una pista de carrera). Resultado: **piezas pegadas**. Cada elemento se
movía por su cuenta, con su propio keyframe y su propio ritmo, y nada se leía
como una sola pieza animada. Rodrigo lo rechazó, con razón.

**Por eso cada escena tiene que ser UN SOLO video**, animado como una unidad:
Pablo y sus props compartiendo la misma luz, el mismo peso y el mismo timing.
No se van a componer capas en el navegador.

---

## 1 · El personaje: reglas duras, no negociables

Pablo es una mascota registrada con un set oficial. **Nunca se genera desde
cero.** Toda animación parte de un render oficial como imagen de entrada.

### Identidad
| Rasgo | Valor |
|---|---|
| Cuerpo | Crema `#FBF3E4`, robot regordete de ~2 cabezas de alto |
| Casco | Marrón oscuro brillante, integrado a la cabeza |
| Emblema | **Flecha zigzag dorada** en el casco. NUNCA un sol, nunca otro símbolo |
| Línea | Contorno oscuro bold en cabeza y torso, más fino en las piernas |
| Cuerpo | Liso: sin muñecas, codos ni rodillas marcados. Joints sutiles en hombros, cadera, cuello y suelas |

### Los ojos — el error más repetido
- **Solo ojos marrones sólidos.**
- ❌ **Sin pestañas.** Le dan lectura femenina y Pablo no lo es.
- ❌ **Sin brillos ni destellos blancos grandes** dentro del ojo.
- Referencia correcta: `FB10_corriendo`, `FB30_anotando`.
- Referencia **prohibida**: `FB27_moneda` (fue vetada por esto exacto).

### Poses prohibidas
- **Ambos brazos arriba en V.** Rodrigo la vetó explícitamente.
- Cualquier pose que no derive de un archivo del set oficial.

### Archivos fuente
```
Projects/Pablo/visual assets/pablo_2d_fullbody/
  03_master/M4_master_joints_cadera_finos.png   ← master de estilo
  04_set_fullbody/FB01…FB37                     ← poses base
```

---

## 2 · Requisitos técnicos (esto decide si el video sirve o no)

El pipeline recorta el fondo por croma y encodea con alfa. Si el video no
cumple esto, **no se puede usar**, por bonito que sea.

1. **Fondo magenta puro y plano** (`#FF00FF`). Nada de gradientes, viñetas,
   texturas, partículas ni sombras proyectadas sobre el fondo.
   El magenta no existe en la paleta de Pablo (crema/marrón/dorado), por eso se
   recorta limpio. Un fondo crema sería imposible de separar de su cuerpo.
2. **Cámara absolutamente fija.** Sin zoom, paneo, dolly, parallax ni shake.
   Si la cámara se mueve, el fondo deja de ser uniforme y el recorte se rompe.
3. **Todo dentro del encuadre, siempre.** Ni un brazo ni un prop puede tocar el
   borde: lo que sale del cuadro se pierde al recortar.
4. **Pies plantados en el mismo punto.** El recorte se ancla al píxel más bajo
   del personaje, que es donde la web dibuja la sombra de contacto.
5. **Loop:** debe terminar en la misma pose en que empieza.
6. **Estilo:** 2D cel-shaded plano, contorno bold, animación tipo Disney con
   anticipación y follow-through, squash & stretch. **24 fps.**
7. **Duración:** 5 s. **Resolución:** 1080p.
8. Sin texto, sin logos, sin marcas de agua.

### Post-proceso (ya existe, no hay que reescribirlo)
```
scratchpad/pablo_anim/pipeline.py
```
Hace: extraer frames → croma normalizado por brillo (invariante a la sombra) →
despill del borde → anclado por los pies → busca el mejor punto de bucle →
encodea WebM VP9 `yuva420p` CRF 40.

**Objetivo de peso: ≤ 200 KB por escena.** El 88% del tráfico es móvil peruano.

---

## 3 · Las cinco escenas

En las cuatro primeras, Pablo **no está solo**: está haciendo algo con props.
Ese fue el pedido central de Rodrigo — *"no quiero que solamente sea Pablo
saludando, sino Pablo con props alrededor de él haciendo algo"*.

---

### Escena 1 · `cama` — "Un amigo que sabe de plata, no otra app de banco"
**Fuente sugerida:** `FB25_celular` + `FB33_durmiendo_espalda`

Pablo echado en **su propia cama**, cómodo, respondiendo mensajes en su celular
como le respondería un pata a otro. La cama entera está en cuadro (cabecera,
colchón, almohada, manta) en el mismo estilo cel-shaded.

Va cambiando de postura sin levantarse: de espaldas con el celular en alto, boca
abajo con los pies cruzados en el aire, la cabeza colgando del borde. La idea es
que se lea **confianza y confort**, no eficiencia.

> **Excepción autorizada:** acá Pablo SÍ puede "teletransportarse" entre
> posturas, con un pop. Es parte del chiste y Rodrigo lo pidió expresamente.
> Es la única escena donde se rompe la regla de continuidad.

---

### Escena 2 · `presupuesto` — "Tú vive tu vida, Pablo lleva las cuentas"
**Fuente sugerida:** `FB30_anotando`

Pablo anotando en su libreta y, **flotando a su lado, un presupuesto en 3D** con
el design kit de Pablo: tarjeta cerámica con barras por categoría, cada una con
su tile de color y su canto sólido inferior.

Las barras **se mueven en tiempo real** mientras Pablo mira y anota: entra un
gasto, la barra salta a su nuevo nivel, aparece el monto. Debe leerse como *"la
persona está gastando ahora mismo y el presupuesto se actualiza solo"*.

Pablo mira las barras, reacciona y anota. El presupuesto flota con vida propia,
como un holograma cerámico.

---

### Escena 3 · `corriendo` — "Cuidar tu plata por fin se siente bien"
**Fuente sugerida:** `FB10_corriendo`

Pablo **corriendo feliz hacia su libertad financiera**.

La clave narrativa: **la meta nunca se acerca**. Pablo corre en el centro, el
suelo se desplaza bajo él y el mundo avanza, pero la meta (una bandera o colina
al horizonte) se queda **siempre a la misma distancia**, quieta. Lo que se mueve
es todo lo demás.

**Llamitas de racha** pasan a su lado en tiempo real, van quedando atrás y
**salen del cuadro** por el borde. Pablo va contento, no sufriendo.

---

### Escena 4 · `soles` — "Cada sol encuentra su lugar"
**Fuente sugerida:** `FB30_anotando` (⚠️ NO usar `FB27_moneda`)

Pablo con su **celular con WhatsApp abierto**, recibiendo mensajes, anotando en
un clipboard — y **pasando lista** a una tropa de monedas.

Los soldaditos: **monedas doradas con el casco de Pablo**, con piernitas y
bracitos, marchando en fila delante de él y saliendo por el otro lado del cuadro.
Deben ser **claramente más chicos que Pablo — como del alto de sus piernas**.
Ojos marrones sólidos, sin pestañas ni brillos.

Pablo los mira pasar y los va contando, como quien revisa que no se le escape
ninguno. Ya existe un primer prop generado en
`scratchpad/pablo_anim/soldado_moneda_raw.png` (nanobanana sobre el master) —
sirve de referencia de diseño para el soldadito.

---

### Escena 5 · `celular` — "Pablo va donde tú vas" (descarga)
**Fuente sugerida:** `FB02_saludando`

Un **mockup de iPhone** en el estilo de Pablo. Al principio Pablo es solo el
**ícono de la app dentro de la pantalla**; después **sale del celular** y queda
parado a su lado como personaje real, **del mismo alto que el celular**.

Rodrigo lo quiere atado al scroll (de logo a personaje mientras se baja, y de
vuelta al subir). Dos formas de entregarlo, en orden de preferencia:

1. **Un clip corto de la transición completa** (logo → sale → parado al lado),
   que la web reproduce hacia adelante o hacia atrás según el scroll. Es la que
   deja el efecto reversible.
2. Si eso no es viable: dos assets separados (celular con logo, y Pablo salido)
   y la web hace la transición. Menos bonito, pero funciona.

Aclarar cuál se entregó, porque cambia el código del slot.

---

## 4 · Dónde caen los archivos

```
public/onboarding/images/pablo/2d/escena-cama.webm
public/onboarding/images/pablo/2d/escena-presupuesto.webm
public/onboarding/images/pablo/2d/escena-corriendo.webm
public/onboarding/images/pablo/2d/escena-soles.webm
public/onboarding/images/pablo/2d/escena-celular.webm
```

Cada bloque de `src/components/sections/Funciones.astro` ya tiene su hueco
marcado con `data-escena="cama"`, `"presupuesto"`, `"corriendo"`, `"soles"` y
`"celular"`. Hoy ese hueco muestra un clip de Pablo solo como respaldo; al
llegar el video de la escena se reemplaza sin tocar el layout.

La web ya resuelve: reproducir solo cuando el bloque está a la vista, caer al
PNG estático si el navegador no soporta alfa en WebM (Safari < 16), y respetar
`prefers-reduced-motion`.

---

## 5 · Checklist antes de entregar

- [ ] Emblema zigzag dorado, nunca un sol
- [ ] Ojos marrones sólidos, **sin pestañas, sin brillos blancos**
- [ ] Ningún brazo en V
- [ ] Fondo magenta plano y uniforme de punta a punta
- [ ] Cámara fija: cero zoom, cero paneo
- [ ] Nada toca el borde del cuadro
- [ ] Pies anclados al mismo punto
- [ ] Cierra en la pose en que abre
- [ ] ≤ 200 KB por escena tras el encode
- [ ] Se ve como **una sola pieza animada**, no como props sueltos moviéndose
