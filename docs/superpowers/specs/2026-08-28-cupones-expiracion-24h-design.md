# Cupones con vencimiento y alcance por plan

Fecha: 2026-08-28
Estado: diseño aprobado, bloqueado por acceso a Supabase

## Problema

Se va a enviar una serie de correos. Uno de ellos ofrece el **plan Anual con 50% de
descuento, válido solo 24 horas**. El sistema de cupones actual no puede soportar esa
oferta por dos razones independientes:

1. **No hay vencimiento.** Un código vive para siempre. La oferta "solo por 24 horas"
   sería mentira: quien lo guarde lo puede usar en tres meses.
2. **El plan Anual está excluido a propósito.** El commit `dfc7300` ("el descuento solo
   vale para los planes Semanal y Mensual (Anual excluido)") y el contrato documentado en
   `src/components/CuentaModal.astro:168` (`descuento_pct`, *solo Semanal/Mensual*, vía la
   constante `cuponMonedaAplicaA`) confirman que hoy un cupón sobre el Anual se rechaza.

El segundo es el más grave. Si el correo se envía sin arreglarlo, el checkout rechaza el
código por "no aplica al plan", el frontend lo descarta **en silencio** y le cobra los
**S/.200 completos** a alguien que hizo clic esperando pagar S/.100.

## Alcance

**Entra:**

- Vencimiento opcional por cupón.
- Alcance de planes por cupón (para poder incluir Anual en este caso y solo en este).
- Multi-uso opcional por cupón (un código compartido en un correo masivo).
- Runbook para crear el cupón a mano cuando se manda el correo.

**No entra (YAGNI):** el usuario confirmó que son "promociones muy exclusivas y a veces no
más pasa". Por lo tanto **no** se construye panel de admin, tabla de campañas, generación
automática, ni códigos únicos por persona. Un `INSERT` manual documentado es suficiente.

**No entra tampoco:** cambios funcionales en el landing (ver sección Frontend).

## Decisiones tomadas

| Decisión | Elección | Razón |
|---|---|---|
| Inicio del reloj | Fecha de vencimiento fija, puesta a mano | El reloj "desde que se genera" mata el cupón si se crea antes de enviar el correo. La fecha fija coincide con el deadline que anuncia el correo. |
| Un código o uno por persona | **Un código compartido** (ej. `ANUAL50`) | Es una oferta pública y anunciada. Los códigos únicos exigen generar N filas y mantener merge fields en el proveedor de correo; no se justifica para un evento raro. |
| Qué cupones vencen | Solo los de campaña por correo | Los cupones de la moneda siguen sin vencer. Nada de lo que está en la calle cambia. |
| Alcance de este cupón | **Solo `Plan Anual`** | Un código exclusivo de 50% no debe poder quemarse en un Semanal de S/.7. |

## Modelo de datos

Tres columnas nuevas en la tabla de códigos de descuento. **Todas nullable, todas opt-in**:
al desplegar, los cupones existentes quedan en NULL y se comportan exactamente como hoy.
Cero regresión.

| Columna | NULL significa | Con valor |
|---|---|---|
| `expira_at timestamptz` | nunca vence (comportamiento actual) | se rechaza a partir de esa fecha |
| `aplica_a text[]` | usa el default actual (Semanal/Mensual) | solo los planes de la lista |
| `max_usos int` | un solo uso (comportamiento actual) | multi-uso hasta el tope |
| `usos int NOT NULL DEFAULT 0` | — | contador de canjes confirmados |

```sql
-- Migración. <tabla_codigos> se confirma con la query de la sección
-- "Dependencia bloqueante" antes de correr esto.
alter table public.<tabla_codigos>
  add column if not exists expira_at timestamptz,
  add column if not exists aplica_a  text[],
  add column if not exists max_usos  int,
  add column if not exists usos      int not null default 0;

-- Búsqueda por código en el checkout (si no existe ya un índice único).
create index if not exists tabla_codigos_codigo_idx
  on public.<tabla_codigos> (codigo);
```

## Validación en `flow-suscripcion` (acción `checkout`)

Orden de chequeos. Cada rechazo es **HTTP 400** y el mensaje **debe contener la palabra
"código"**:

1. No existe → `"Ese código no existe."`
2. `expira_at is not null and expira_at < now()` → `"Ese código ya venció."`
3. Plan solicitado no está en `aplica_a` (o en el default si es NULL) → `"Ese código no aplica a este plan."`
4. `max_usos is not null and usos >= max_usos` → `"Ese código ya se agotó."`
5. `max_usos is null` y ya fue usado → `"Ese código ya fue usado."` (comportamiento actual)

### Por qué el mensaje debe decir "código"

`src/components/onboarding/steps/StepCuentaPago.astro:377` y
`src/components/CuentaModal.astro:420` contienen:

```js
if (registro.__status === 400 && codigo && /c[oó]digo/i.test(registro.error || "")) {
```

Ese regex es lo único que dispara "descarta el cupón y reintenta el checkout sin él". Un
mensaje como `"Cupón vencido"` **no hace match**: el frontend no reintenta y el pago muere
con un error genérico. El contrato del mensaje es parte de la API, no cosmética.

## Conteo de usos

`usos` se incrementa **en el webhook del cobro confirmado**, no al armar el checkout. Si se
contara al armar, cualquiera que abra el widget de Flow y se arrepienta quemaría un uso.

## Frontend: cero cambios funcionales

El landing ya soporta todo el flujo:

- Captura `?codigo=` de la URL (`src/scripts/onboarding.js:669`, `CuentaModal.astro:178`).
- Lo persiste en `sessionStorage.pablo_codigo_descuento`, en MAYÚSCULAS y sin espacios.
- Lo manda como `codigo` en la acción `checkout`.
- Muestra `registro.error` textual, así que **el backend controla el copy del error**.
- Pinta `descuento_pct` en el resumen, incluido el caso `>= 100` ("primer cobro gratis").
- Ante rechazo, avisa y reintenta sin cupón: el cupón nunca bloquea un pago.

Único detalle cosmético, opcional: el `placeholder` del input dice `MONEDA-XXXXXX`
(`StepCuentaPago.astro:44`). Un código `ANUAL50` funciona igual, solo se ve inconsistente.

## Runbook: cómo ingresar el código

Cada vez que se manda un correo de oferta (operación de ~1 minuto):

1. Entrar al dashboard de Supabase, proyecto `mezpfnagkubumzbromsh`.
2. **SQL Editor** → pegar y ajustar:

```sql
insert into public.<tabla_codigos>
  (codigo, descuento_pct, aplica_a, expira_at, max_usos)
values
  ('ANUAL50', 50, array['Plan Anual'],
   -- Deadline que anuncia el correo, hora de Lima (UTC-5).
   '2026-09-01 23:59:00-05', 300);
```

3. Repartir el link en el correo:
   `https://usapablo.app/pricing?codigo=ANUAL50`
   (o `https://usapablo.com/onboarding?codigo=ANUAL50`)

Alternativa sin SQL: **Table Editor → Insert row** y llenar el formulario.

Reglas al crear el cupón:

- **Código en MAYÚSCULAS.** El frontend hace `.trim().toUpperCase()` antes de enviarlo, así
  que un código guardado en minúsculas nunca hace match.
- **`expira_at` con offset de Lima** (`-05`), o el cupón muere 5 horas antes de lo anunciado.
- **`aplica_a` con el nombre exacto del plan** que manda el frontend: `Plan Semanal`,
  `Plan Mensual`, `Plan Anual` (ver `NOMBRE_PLAN` en `StepCuentaPago.astro:111`).
- **`max_usos` con colchón.** Es un código compartido; si se agota, la gente que llega
  después paga precio full sin entender por qué.

Para verificar antes de enviar el correo: abrir el link en una ventana privada y confirmar
que el resumen del checkout dice "Incluye tu 50% de descuento en el primer cobro".

## Dependencia bloqueante: acceso a Supabase

El código de generación y validación **no está en ningún repo local**. Se verificó buscando
`cuponMonedaAplicaA`, `moneda-pablo`, `flow-suscripcion`, `cupones` y `codigos_descuento` en
todo `C:/Users/HP/Documents/GitHub/`: los únicos resultados son los 4 archivos del landing
que consumen la API. Las edge functions están desplegadas en el proyecto
`mezpfnagkubumzbromsh` sin fuente versionada.

El CLI de Supabase local está autenticado con una cuenta que solo ve el proyecto
"Hackaton AIdea", no el de Pablo.

Falta confirmar dos cosas antes de poder escribir la migración y el parche definitivos:

**1. Nombre real de la tabla y sus columnas.** Correr en el SQL Editor:

```sql
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and (table_name ilike '%cupon%' or table_name ilike '%codigo%'
       or table_name ilike '%moneda%' or table_name ilike '%descuento%')
order by table_name, ordinal_position;
```

**2. Código de las edge functions `flow-suscripcion` y `moneda-pablo`**, para ubicar
`cuponMonedaAplicaA` y el punto exacto donde validar. Dashboard → Edge Functions → ver el
código, o vía CLI con la cuenta correcta:

```bash
npx supabase login
npx supabase link --project-ref mezpfnagkubumzbromsh
npx supabase functions download flow-suscripcion
npx supabase functions download moneda-pablo
```

Recomendación aparte: versionar esas dos funciones en un repo. Hoy son código de producción
que cobra dinero y existe en un solo lugar, sin historial.

## Riesgos de negocio a decidir antes de enviar

- **Descuento sobre descuento.** La landing ya muestra el Anual tachado S/.240 → S/.200
  (`src/components/sections/Pricing.astro:379`). Con 50% encima el primer año sale S/.100.
  Confirmar que ese es el número que se quiere comunicar.
- **Renovación a precio full.** El descuento aplica solo al primer cobro; para el Anual el
  primer cobro es el año entero, así que el año 2 se cobra S/.200. Debe estar en la letra
  chica del correo o habrá reclamos en 12 meses.
- **Filtración del código.** Un código compartido puede terminar en redes. Acotado por
  `expira_at` y `max_usos`, y de todos modos es una oferta que se está anunciando
  públicamente.

## Criterios de aceptación

1. Un cupón con `expira_at` en el pasado se rechaza con 400 y mensaje que contiene "código";
   el checkout se rearma solo y cobra precio full sin trabarse.
2. Un cupón con `expira_at` en el futuro aplica el descuento y el resumen lo refleja.
3. Un cupón con `aplica_a = ['Plan Anual']` aplica en Anual y se rechaza en Semanal/Mensual.
4. Un cupón existente de la moneda (las cuatro columnas en NULL) se comporta igual que antes
   del cambio: Semanal/Mensual, un uso, sin vencimiento.
5. `usos` sube solo cuando el cobro se confirma, no al abrir el widget de Flow.
