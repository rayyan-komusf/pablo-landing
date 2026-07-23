// Testimonios reales de usuarios de Pablo: entrevistas de usuarios activos,
// comentarios de Instagram y feedback directo. Para sumar uno nuevo basta
// agregarlo a esta lista — el carrusel lo recoge solo.
export interface Testimonio {
  texto: string;
  nombre: string;
  detalle?: string;
}

export const TESTIMONIOS: Testimonio[] = [
  {
    texto:
      'Antes me sentía como un niño que no tenía autocontrol de su dinero. Usando a Pablo, no solo me ahorré el 30-40% en gastos hormigas, sino que ahora me siento una persona más responsable, tranquila y ya no estoy estresado todos los días por dinero.',
    nombre: 'Eduardo S.',
    detalle: '21 años',
  },
  {
    texto: 'Con Pablito ya saqué mi promedio en taxis 🚕 y me quiero morir jajaja',
    nombre: '@wildcinnamon',
    detalle: 'vía Instagram',
  },
  {
    texto:
      'Es muy fácil usarlo. Antes de que me olvide el gasto, puedo mandar un audio o escribir en la noche y lo registra. Me ayuda a ver dónde va cada sol, ordenar mis finanzas y ponerle límites a mis gastos hormigas.',
    nombre: 'Gabriela C.',
    detalle: '28 años',
  },
  {
    texto: 'Pablo me cambia la vida, la verdad.',
    nombre: 'Adrian G.',
    detalle: 'Usuario de Pablo',
  },
  {
    texto:
      'Antes agarraba un papel y lapicero; ahora le tomo la foto por WhatsApp, se sube todo y me da un reporte al instante.',
    nombre: 'Daniel V.',
    detalle: 'Usuario de Pablo',
  },
  {
    texto: 'Si Pablo desapareciera, lo que más extrañaría es la visibilidad de todo.',
    nombre: 'Mirella L.',
    detalle: 'Usuaria de Pablo',
  },
  {
    texto:
      '¡Qué gran ayuda está siendo Pablo! Nos quita un peso de encima para no llegar tan ajustados a fin de mes.',
    nombre: 'Lady A.',
    detalle: '27 años',
  },
  {
    texto:
      'Si ya no tuviera Pablo, otra vez volvería al desorden en el que estaba: todo en el aire. Ya estoy muy acostumbrado a tener orden.',
    nombre: 'Rodrigo P.',
    detalle: 'Usuario de Pablo',
  },
  {
    texto:
      'Ya tengo Pablo, es una maravilla: me obliga a saber dónde se va mi dinero y me encanta esa sensación de control 🥳',
    nombre: 'Usuaria de Pablo',
    detalle: 'vía Instagram',
  },
];
