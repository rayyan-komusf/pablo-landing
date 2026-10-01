# Landing y onboarding: iconos anteriores vs nuevos

## Estado

Código preparado para `landing-icons-v1`. No activar el experimento hasta verificar
el proyecto de PostHog de Pablo y publicar este commit en EasyPanel (usapablo.com).
La integración accesible durante la preparación solo devolvió Clidenta; no se
creó ni modificó un experimento allí.

## Variantes

- `control` (50%): iconos y presentación anteriores al PR #4, referencia `8c356ee`.
- `test` (50%): iconos WebP, decoración y animaciones del PR #4 (`34924c4`).
- Participación: 100% de visitantes elegibles; PostHog asigna la variante.
- Ambas variantes comparten formularios, textos, precios y el paso a WHOP.
- No se duplican inputs, IDs ni manejadores de pago.

La elección de asignación por dispositivo o usuario está pendiente de la respuesta
del propietario. Se recomienda dispositivo para este recorrido previo al login.
El SDK que sirve `ph.usapablo.app/static/array.js` es 1.435.6, compatible con
asignación por dispositivo. No hay que cambiar la clave pública del proyecto.

## Configuración en PostHog

Crear un experimento «Pablo: iconos nuevos en landing y onboarding» en el proyecto
que recibe los eventos de usapablo.com, con la flag `landing-icons-v1` y los dos
valores exactos anteriores. Hipótesis: la nueva iconografía mejora la conversión
al registro manteniendo el mismo recorrido y oferta.

Si se confirma dispositivo, crear primero la flag inactiva con
`bucketing_identifier: device_id`, sin persistencia entre identidades, y vincular
el experimento por la clave. Si se elige usuario, dejar que el experimento cree
su propia flag. No cambiar la asignación una vez iniciado el experimento.

Comprobar los eventos reales antes de configurar las métricas. Candidata principal:
conversión desde exposición a `onboarding_cuenta_creada` (registro exitoso, emitido
por StepCuentaPassword). No confundir `onboarding_completed`, que marca el final
del cuestionario, con una compra. Reutilizar una métrica guardada equivalente si
existe. La llegada a WHOP no demuestra un pago; no medirla como ingreso.

Verificar `resolved_exposure_event` del experimento y su compatibilidad con el SDK
antes del lanzamiento. El código deja al SDK registrar su exposición automática
con `getFeatureFlag` después de aplicar la variante. No inventa eventos de pago.

## Asignación y medición

- El control funciona sin JavaScript, sin PostHog o con un bloqueador.
- Una copia local válida durante 24 h permite restaurar el diseño antes de pintar.
  Es una ayuda visual, no una asignación aleatoria ni prueba de exposición.
- PostHog se inicia sin esperar `load`, para resolver la variante antes de usar
  la página. La petición de red sigue siendo asíncrona.
- Solo una respuesta explícita `control` o `test` confirmada produce exposición.
- Si el usuario interactúa o pasan 1,5 s desde DOMContentLoaded antes de resolver,
  no se cambia el diseño y se guarda la respuesta para la página siguiente.
  Se excluyen ambos brazos por igual en ese caso, evitando sesgo hacia control.
- Un flag desactivado borra la copia local y no produce exposición.
- Vista previa local: `?icons-preview=control` / `?icons-preview=test`.
  Solo funciona en localhost, sin persistencia ni exposición al experimento.
- `AbTests.astro` conserva el experimento de texto del hero y la atribución de anuncios.

## Verificación y publicación

1. `npm test`: asignación, exposición, fallos de red/storage, caché y otras pruebas existentes.
2. `npx playwright test --workers=1`: usa la compilación de producción; revisa
   ambos diseños en móvil/escritorio y los planes semanal, mensual y anual.
   Las llamadas de pago y registro están simuladas, sin cobros reales.
3. En EasyPanel publicar el repositorio **pablo-landing**, conservando sus variables
   `PUBLIC_POSTHOG_KEY` y `PUBLIC_POSTHOG_HOST` de Pablo. No publicar el build local:
   no tiene las credenciales de Notion y omite sus artículos al recibir 401.
4. Confirmar en usapablo.com que se sirve `landing-icons-v1` y cargar una evaluación
   real de la flag en el proyecto correcto antes de activar el reparto 50/50.
5. Verificar exposición y registro real en PostHog, sin considerar la navegación
   al checkout como compra. Reparto 50/50 probabilístico; no exige igualdad exacta
   con pocas visitas. Aún no hay ganador ni cálculo de muestra con datos de Pablo.

WHOP: S/7 cada 7 días, S/20 cada 30 días y S/200 cada 365 días. El onboarding
conserva sesión/plan por `/auth/sesion` (tokens únicamente en el fragmento) y pasa
a la app para WHOP. No inicia llamadas a Flow ni ofrece trials. El plan Gratis
es independiente de una prueba gratuita de Premium.
