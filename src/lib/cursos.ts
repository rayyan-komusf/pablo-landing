// Camino al Millón: datos compartidos entre el índice de cursos y las
// páginas de cada sesión. Cada sesión lleva la carta original de Rodrigo
// como descripción; los datos del Google Meet en vivo se reemplazan por
// el CTA "Desbloquea a Pablo" en la página.

export interface Sesion {
  slug: string;
  label: string;
  nombre: string;
  videoId: string;
  parrafos: string[];
}

export const CURSO = {
  title: "Camino al Millón",
  description:
    "El programa de finanzas de Pablo, completo y gratis: 4 sesiones para aprender a ahorrar, hacer tu presupuesto, ponerte metas reales y salir de deudas.",
  portada: "/cursos/camino-al-millon.webp",
};

export const SESIONES: Sesion[] = [
  {
    slug: "sesion-1-ahorro",
    label: "Sesión 1",
    nombre: "Ahorro",
    videoId: "o4kCMoCpQ7I",
    parrafos: [
      `cuando tenía 19 años, malgasté mis S/.15 000 de ahorros en menos de 5 meses`,
      `me di cuenta comprando una mantequilla de S/14 en plaza vea, cuando me rechazaron la tarjeta`,
      `(que palta xd)`,
      `en ese momento, no sabía cómo había desaparecido mi dinero, pero sí tenía una cosa en claro:`,
      `si quería ser millonario, no me podía estar quedando en cero a cada rato...`,
      `y eso es exactamente lo que estaremos viendo en la primera sesión del programa 🏆`,
      `por eso, si eres alguien que se queda en cero mes a mes, siempre dices que vas a ahorrar pero nunca te sobra nada y estás constantemente estresado por la falta de dinero - no te puedes perder esta clase`,
      `de acá a 3 meses, ni siquiera se van a reconocer de lo mucho que han avanzado en su propio camino - y estoy emocionado por ir acompañándolos durante ese cambio`,
      `ahí los veo, futuros millonarios`,
      `- rodrigo`,
    ],
  },
  {
    slug: "sesion-2-presupuesto",
    label: "Sesión 2",
    nombre: "Presupuesto",
    videoId: "H-8B7RUHgh0",
    parrafos: [
      `hace tiempo, pensaba que si solo conseguía ganar más, todos mis problemas se irían`,
      `pero si fuera así, no habrían atletas millonarios cayendo en bancarrota después de jubilarse o ganadores de lotería que terminan más pobres que antes`,
      `con el tiempo, aprendí que ganar y administrar dinero son dos habilidades completamente distintas`,
      `pero la segunda nadie te enseña — ni en el colegio, ni en la universidad, ni en tu casa y al final, terminas pasando toda tu vida estresándote cada 30 días porque tienes que pedir prestado nuevamente`,
      `¿lo bueno?`,
      `esto es algo con lo que sufren millones de personas todos los días, y la respuesta es mucho más simple de lo que piensas`,
      `por eso, en esta sesión estaré enseñando: ¿cómo crear tu primer plan financiero consciente para alcanzar tu propia vida millonaria?`,
      `no te voy a prometer que vas a cambiar tu vida en una hora pero sí te puedo decir que después de esta clase, te vas a despedir para siempre de los gastos culposos`,
      `si te perdiste la sesión de ahorro, no pasa nada — estás a tiempo para seguir el programa con nosotros - pero si pudiste verla, hoy le agregamos la pieza que faltaba`,
      `ahí los veo, futuros millonarios`,
      `- rodrigo`,
    ],
  },
  {
    slug: "sesion-3-metas",
    label: "Sesión 3",
    nombre: "Metas",
    videoId: "Oe5CuEvjGmI",
    parrafos: [
      `hace dos años, pensaba que mi vida no iba tan mal...`,
      `tenía un trabajo estable, estaba a dos meses de por fin terminar una carrera y hasta tenía más de S/.60 000 entre ahorros e inversiones... de afuera parecía que iba "por buen camino"`,
      `pero todos los días me subía al transporte público 2-3 horas ida y vuelta, para hacer algo que no me emocionaba, y ayudar a construir el sueño de alguien más`,
      `en ese momento, si me preguntabas qué quería para mi futuro, no sabía qué responder`,
      `quería ser millonario, pero nunca me había puesto un objetivo claro`,
      `ahí fue cuando entendí algo importante:`,
      `de nada sirve aprender a ahorrar (sesión 1) y a hacer un presupuesto (sesión 2) si no sabes hacia dónde estás remando`,
      `y por eso, en la sesión 3, quiero enseñarte a hacer lo mismo: convertir un "ya quisiera" en una meta tan concreta que sea casi INEVITABLE alcanzarla`,
      `puedes ser el más ordenado del mundo y aun así sentir que no avanzas — porque ahorrar sin una meta es solo juntar plata por juntarla`,
      `ahí los veo, futuros millonarios`,
      `- rodrigo`,
    ],
  },
  {
    slug: "sesion-4-deudas",
    label: "Sesión 4",
    nombre: "Deudas",
    videoId: "VpFiXNpq7wI",
    parrafos: [
      `les voy a confesar algo que no es muy "coach financiero" de mi parte…`,
      `mientras les enseñaba a ahorrar (sesión 1), hacer un presupuesto (sesión 2) y a ponerse metas (sesión 3) - yo fui acumulando más de S/.180 000 en deuda entre tarjetas, préstamos, líneas de crédito, etc.`,
      `y la fui acumulando, a propósito, construyendo Pablo...`,
      `pero aunque al principio suene loco, lo haría todo de nuevo`,
      `porque mientras la mayoría de personas usa la deuda como una extensión de su sueldo...`,
      `usando la tarjeta para no tener que pagar hasta el próximo mes, y al momento de cobrar, todo se va a pagar el balance - obligándolos a usar la tarjeta de nuevo, entrando al temido "círculo vicioso"`,
      `como una rueda que gira y gira y parece que nunca te vas a bajar`,
      `con los años entendí algo que casi nadie te dice:`,
      `la deuda no es buena ni mala — solo depende de tu capacidad de usarla`,
      `la misma tarjeta que a una persona la hunde, a otra la impulsa...`,
      `la diferencia no está en la deuda… sino en quién maneja a quién`,
      `por eso en la sesión 4 vamos a aprender no solo a salir de deudas para siempre, sino estaremos reprogramando tu mente para ver la deuda como una herramienta en el camino a tu libertad financiera`,
      `puedes tener el mejor presupuesto y las metas más claras del mundo, pero si cada mes le entregas el sueldo a una tarjeta, no estás avanzando — estás remando contra-corriente`,
      `ahí los veo, futuros millonarios`,
      `- rodrigo`,
    ],
  },
];
