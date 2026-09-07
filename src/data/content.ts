// ─────────────────────────────────────────────────────────────
// CONTENIDO PLACEHOLDER — reemplaza todo lo marcado con TODO
// Este es el único archivo que necesitas editar para actualizar
// los textos, terapias, testimonios y enlaces del sitio.
// ─────────────────────────────────────────────────────────────

export interface Family {
  key: string;
  name: string;
  teaser: string; // frase breve y atractiva para la tarjeta de familia en el Inicio
}

export const LOCATIONS = [
  { key: "las-vegas", name: "Las Vegas" },
  { key: "miami", name: "Miami" },
] as const;

export type LocationKey = (typeof LOCATIONS)[number]["key"];

export interface LocationPricing {
  price: string; // ej. "$350" o "Desde $500"
  priceNote?: string; // ej. "Mínimo: 2 personas"
}

export interface Therapy {
  id: string;
  family: string; // debe coincidir con Family.key
  name: string;
  tags: string[];
  shortDescription: string; // resumen de 1 línea para la tarjeta
  duration: string; // formato completo, ej. "2 horas 30 minutos"
  durationShort: string; // formato compacto para la tarjeta, ej. "2h 30min"
  // Si a una ciudad le falta la entrada, la terapia no se ofrece ahí.
  pricing: Partial<Record<LocationKey, LocationPricing>>;
  paragraphs: string[];
  list?: string[]; // lista con viñetas, si aplica (ej. LNT · Reconexión)
  idealFor: string;
  disclaimer?: string;
}

// El slug del tipo de evento de Cal.com para cada terapia+ciudad.
// Las Vegas usa el slug base (sin sufijo, igual que antes); Miami usa
// "-miami" al final, porque tiene su propio calendario/disponibilidad.
export function calSlugFor(therapyId: string, location: LocationKey): string {
  return location === "miami" ? `${therapyId}-miami` : therapyId;
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
}

export interface FAQItem {
  question: string;
  answer: string[];
}

// Nombre de usuario de Cal.com (cal.com/tu-usuario).
// IMPORTANT: el "id" de cada terapia en THERAPIES debe coincidir exactamente
// con el slug del tipo de evento creado en Cal.com para esa terapia
// (Event Types → tu evento → URL: cal.com/renaser/ESTE-SLUG).
export const CAL_USERNAME = "renaser";

// URL pública de tu perfil en Cal.com (lista todos tus eventos).
export const BOOKING_URL = `https://cal.com/${CAL_USERNAME}`;

export const SITE = {
  name: "RenaSER",
  tagline: "Bienestar\ndesde adentro",
  motto: "Nutre. Equilibra. Transforma. Renace.",
  aboutShort:
    "Un espacio donde el Reiki se encuentra con la mediumnidad, y el cuidado del cuerpo con el del alma.",
  phone: "+1 702 468 9914",
  email: "casarenaser@gmail.com",
  address: "Las Vegas, NV",
  facebookUrl: "https://www.facebook.com/martha.gonzalez.829085",
  instagramUrl: "https://www.instagram.com/martha_medium/",
};

// Aviso informativo de fechas — se muestra en la página de Terapias.
// TODO: quitar o actualizar cuando cambien las fechas/ubicación
export const POPUP_EVENT = {
  active: true,
  city: "Miami",
  dateRange: "15 de octubre – 1 de noviembre"
};

// Texto de misión/filosofía de marca — usado en la sección "Filosofía" del Inicio
export const MISSION_TEXT =
  "El bienestar no es solo cuidar el cuerpo: es nutrir tu energía, tu mente y tu equilibrio — pequeños rituales para sentirte bien por dentro y por fuera.";

// Disclaimer por defecto — se muestra en toda terapia que no tenga uno propio (más específico) en THERAPIES.
export const DEFAULT_DISCLAIMER =
  "Esta experiencia es una práctica complementaria de bienestar y no sustituye diagnóstico, tratamiento ni seguimiento médico o psicológico.";

// Cita de cierre para la página "Terapeutas"
export const ABOUT_QUOTE = [
  "El despertar duele. Duele porque empiezas a ver lo que antes ignorabas,\nporque reconoces heridas, patrones y vínculos que ya no puedes seguir sosteniendo.",
  "No todos entenderán tu despertar, porque no todos han recorrido tu camino.",
  "Sigue sanando. Sigue creciendo. Sigue eligiéndote.",
];

export interface FormationGroup {
  label: string; // ej. "Maestrías en Reiki" — el prefijo común, para no repetirlo en cada item
  items: string[];
}

export interface Therapist {
  id: string;
  name: string;
  title: string;
  bio: string[];
  formation: FormationGroup[];
  closing?: string[];
}

export const THERAPISTS: Therapist[] = [
  {
    id: "martha",
    name: "Martha",
    title: "Terapeuta holística · Maestra Reiki · Médium · LNT",
    bio: [
      "Mi conexión con el mundo espiritual comenzó mucho antes de convertirme en terapeuta.",
      "Desde pequeña he podido percibir aquello que no siempre podemos ver. Puedo sentir y ver el aura de las personas, conectar con espíritus y percibir imágenes e información relacionada con vidas pasadas. Con los años entendí que esta sensibilidad y mi mediumnidad formaban parte de mí y aprendí a desarrollarlas y acompañarlas con estudio, formación y diferentes herramientas holísticas.",
      "Hoy integro esa percepción intuitiva con Reiki, LNT, biodescodificación, vidas pasadas, cristales y Registros Akáshicos. Cada persona que llega a mí tiene una historia diferente, por eso cada experiencia también lo es. Mi intención es escuchar, observar y permitir que el proceso vaya mostrando aquello que necesita ser trabajado.",
    ],
    formation: [
      { label: "Maestrías en Reiki", items: ["Tibetano Tántrico", "Celta", "Kundalini", "Angélico"] },
      { label: "LNT (La Nueva Terapia)", items: ["Segundo Nivel y Maestría"] },
      {
        label: "Terapeuta en",
        items: ["Energía Tameana", "Biodescodificación", "Vidas Pasadas", "Cristales Etéreos", "Registros Akáshicos"],
      },
      { label: "Otras formaciones", items: ["Neuroterapeuta"] },
    ],
    closing: [
      "Pero mi vida no ocurre solamente dentro de una terapia. Soy madre, esposa, amante de la naturaleza y disfruto enormemente algo tan sencillo como sentarme a tomar una taza de café.",
      "Creo que lo espiritual también se encuentra ahí: en nuestra vida cotidiana, en la naturaleza, en las personas que amamos y en esos pequeños momentos en los que simplemente nos permitimos estar presentes.",
      "En Renaser pongo mi sensibilidad, mi experiencia y todo lo que he aprendido al servicio de cada persona, respetando siempre que cada camino y cada proceso son únicos.",
    ],
  },
  {
    id: "carlos",
    name: "Carlos",
    title: "Terapeuta holístico · Maestro Reiki · LNT · Sonoterapia",
    bio: [
      "Para mí, cada terapia comienza mucho antes de trabajar con la energía: comienza conociendo a la persona que tengo delante.",
      "Me encanta conversar, escuchar historias y conectar con las personas. No concibo este trabajo desde la distancia entre “terapeuta” y “paciente”. Con el tiempo, muchas de las personas que llegan a mí terminan convirtiéndose en amigos y algunas llegan a sentirse incluso como parte de mi familia.",
      "Esa cercanía forma parte de mi manera de trabajar. Me gusta que quien llegue a Renaser pueda sentirse cómodo, escuchado y acompañado, y que encuentre un espacio donde pueda simplemente ser.",
      "Mi camino dentro de las terapias holísticas me ha llevado a formarme en diferentes disciplinas y sistemas energéticos que hoy puedo integrar y adaptar a cada experiencia.",
    ],
    formation: [
      { label: "Maestrías en Reiki", items: ["Tibetano Tántrico", "Celta", "Kundalini"] },
      { label: "LNT (La Nueva Terapia)", items: ["Segundo Nivel y Maestría"] },
      { label: "Terapeuta en", items: ["Energía Tameana"] },
      { label: "Otras formaciones", items: ["Certificación en Sonoterapia"] },
    ],
    closing: [
      "Creo profundamente en el valor de la conexión humana. Por eso, más allá de las técnicas y de todo lo aprendido durante estos años, mi manera de acompañarte siempre comienza desde la cercanía, la conversación y el respeto por tu propio proceso.",
    ],
  },
];

export const FAMILIES: Family[] = [
  {
    key: "reiki",
    name: "Reiki & Energía",
    teaser: "Armoniza tu energía, tus chakras y tu mente desde la calma.",
  },
  {
    key: "lnt",
    name: "LNT",
    teaser: "Un trabajo profundo desde el cuerpo, la emoción y el espíritu.",
  },
  {
    key: "sonoterapia",
    name: "Sonoterapia",
    teaser: "Deja que el sonido y la vibración te lleven al equilibrio.",
  },
  {
    key: "espacios",
    name: "Espacios",
    teaser: "Renueva la energía de tu hogar o negocio.",
  },
];

// IMPORTANT: el "id" de cada terapia debe coincidir exactamente con el slug
// del tipo de evento creado en Cal.com para esa terapia
// (Event Types → tu evento → URL: cal.com/renaser/ESTE-SLUG).
export const THERAPIES: Therapy[] = [
  {
    id: "reiki-esencia",
    family: "reiki",
    name: "Reiki Esencia",
    tags: ["Limpieza energética", "Chakras", "Mediumnidad", "Vidas pasadas"],
    shortDescription:
      "Una experiencia profunda de Reiki creada para armonizar tu energía y reconectar contigo desde la calma.",
    duration: "2 horas",
    durationShort: "2h",
    // TODO: confirmar precio real de Miami — por ahora usa el mismo que Las Vegas.
    pricing: { "las-vegas": { price: "$250" }, miami: { price: "$350" } },
    paragraphs: [
      "La sesión comienza con una lectura energética de los chakras para identificar bloqueos, desequilibrios o áreas que necesitan mayor atención. A partir de esta lectura se realiza una limpieza energética profunda y un trabajo de Reiki personalizado.",
      "Durante el proceso pueden incorporarse herramientas de mediumnidad y exploración de vidas pasadas, cuando surjan de manera natural durante la sesión, permitiendo observar patrones, emociones o memorias que desde una perspectiva espiritual puedan estar relacionadas con tu momento presente.",
      "La experiencia se complementa con una esterilla térmica de cuarzo, combinando calor, relajación y trabajo energético.",
    ],
    idealFor:
      "momentos de cambio, sensación de carga o estancamiento, búsqueda de equilibrio emocional, reconexión personal y renovación energética.",
  },
  {
    id: "enfoque-concentracion",
    family: "reiki",
    name: "Enfoque & Concentración",
    tags: ["Claridad mental", "Tercer ojo", "Amatista", "Llama Violeta"],
    shortDescription:
      "Una experiencia de Reiki, amatista y Llama Violeta creada para recuperar claridad, presencia y dirección.",
    duration: "2 horas 30 minutos",
    durationShort: "2h 30min",
    // TODO: confirmar precio real de Miami — por ahora usa el mismo que Las Vegas.
    pricing: { "las-vegas": { price: "$300" }, miami: { price: "$500" } },
    paragraphs: [
      "La sesión comienza con Reiki y activaciones enfocadas especialmente en el chakra del tercer ojo, tradicionalmente relacionado con la percepción, la intuición y la claridad interior.",
      "El proceso incorpora una meditación específica de la Llama Violeta, canalizada y creada especialmente para Casa Renacer. Desde esta práctica espiritual, la Llama Violeta se utiliza como símbolo y herramienta de transmutación para liberar energías densas y favorecer una sensación de renovación y claridad.",
      "La experiencia se realiza sobre una esterilla térmica de cuarzo amatista, piedra tradicionalmente asociada con la serenidad, la intuición y el equilibrio.",
      "A continuación se realiza un suave deslizamiento a lo largo de la columna vertebral orientado a liberar tensiones y nudos energéticos y favorecer la conexión entre el cuerpo físico y los cuerpos sutiles.",
      "La sesión continúa con un trabajo energético tridimensional alrededor de la cabeza y finaliza con una integración de los cuerpos sutiles con el cuerpo físico, buscando regresar a un estado de presencia, estabilidad y enfoque.",
    ],
    idealFor:
      "emprendedores, estudiantes, profesionales, traders, creativos y personas que atraviesan períodos de alta exigencia mental o necesitan recuperar enfoque y dirección.",
  },
  {
    id: "reiki-origen",
    family: "reiki",
    name: "Reiki Origen",
    tags: ["Reiki", "Biodescodificación", "Emociones", "Meditación sonora"],
    shortDescription:
      "Reiki y biodescodificación para explorar tu bienestar desde una mirada holística, más allá del síntoma.",
    duration: "2 horas 30 minutos",
    durationShort: "2h 30min",
    // TODO: confirmar precio real de Miami — por ahora usa el mismo que Las Vegas.
    pricing: { "las-vegas": { price: "$300" }, miami: { price: "$450" } },
    paragraphs: [
      "Desde la mirada holística, el cuerpo, las emociones y nuestra historia personal están profundamente relacionados. Por ello, durante la sesión se exploran experiencias, conflictos, patrones emocionales y situaciones de vida que puedan estar vinculados, desde la percepción de la persona, con su estado actual.",
      "El Reiki acompaña este proceso mediante un trabajo de armonización energética que proporciona un espacio de calma, observación y conexión interior.",
      "Como cierre se realiza una meditación acompañada por baño de sonido, permitiendo integrar el trabajo realizado durante la sesión. El sonido y la vibración crean un espacio de relajación en el que cuerpo, mente y energía pueden asimilar el proceso desde la calma.",
    ],
    idealFor:
      "quienes desean mirar más allá del síntoma y explorar posibles patrones emocionales, personales y energéticos desde una perspectiva holística.",
    disclaimer:
      "Esta experiencia es una práctica complementaria de bienestar y exploración personal y no sustituye diagnóstico, tratamiento ni seguimiento médico o psicológico.",
  },
  {
    id: "lnt-reconexion",
    family: "lnt",
    name: "LNT · Reconexión",
    tags: ["Cuerpo", "Emoción", "Espíritu"],
    shortDescription: "Un trabajo energético y espiritual profundo desde el cuerpo, la emoción y el espíritu.",
    duration: "2 horas",
    durationShort: "2h",
    // TODO: confirmar precio real de Miami — por ahora usa el mismo que Las Vegas.
    pricing: { "las-vegas": { price: "$150" }, miami: { price: "$300" } },
    paragraphs: [
      "LNT (La Nueva Terapia) es una práctica energética y espiritual que trabaja desde el poder de la atención y, especialmente, de la intención, contemplando al ser humano desde tres dimensiones que se relacionan entre sí:",
    ],
    list: [
      "Cuerpo físico: se dirige la intención hacia el cuerpo y las áreas asociadas con las molestias o síntomas que la persona desea trabajar.",
      "Cuerpo emocional: se exploran cargas, bloqueos, patrones y memorias emocionales y, dentro del marco espiritual de LNT, elementos relacionados con karmas y vidas pasadas.",
      "Cuerpo espiritual: se trabaja desde las creencias de LNT sobre desequilibrios, influencias o interferencias que puedan estar afectando el bienestar espiritual.",
    ],
    idealFor:
      "personas interesadas en realizar un trabajo energético y espiritual profundo y explorar su bienestar desde una perspectiva integral.",
    disclaimer:
      "LNT es una práctica espiritual y complementaria y no sustituye atención médica, psicológica ni otros tratamientos profesionales.",
  },
  {
    id: "lnt-armonizacion-grupal",
    family: "lnt",
    name: "LNT · Armonización Grupal",
    tags: ["Parejas", "Familias", "Empresas", "Equipos"],
    shortDescription: "Armoniza el campo energético compartido entre parejas, familias o equipos.",
    duration: "1 hora 15 minutos",
    durationShort: "1h 15min",
    // TODO: confirmar precio real de Miami — por ahora usa el mismo que antes.
    pricing: {
      "las-vegas": { price: "$100 por persona", priceNote: "Mínimo: 2 personas" },
      miami: { price: "$150 por persona", priceNote: "Mínimo: 2 personas" },
    },
    paragraphs: [
      "Una experiencia basada en los principios de LNT que lleva el trabajo energético más allá del individuo para enfocarse en el campo energético compartido por un grupo.",
      "Cada persona posee su propio campo o globo energético, pero al convivir, trabajar o compartir un propósito con otras personas también se generan dinámicas energéticas grupales.",
      "La sesión busca armonizar estos campos, liberar cargas y favorecer una sensación de equilibrio, cohesión y renovación dentro del grupo.",
      "Puede realizarse desde dos personas y adaptarse a diferentes tipos de vínculos y dinámicas.",
    ],
    idealFor:
      "matrimonios y parejas, familias, socios, staff de compañías, equipos de trabajo, equipos deportivos y otros grupos que comparten regularmente un mismo espacio o propósito.",
  },
  {
    id: "reiki-sonoro",
    family: "sonoterapia",
    name: "Reiki Sonoro",
    tags: ["Reiki", "Sonido", "Vibración", "Equilibrio"],
    shortDescription: "Reiki y sonoterapia combinados para aquietar la mente, liberar tensión y recuperar el equilibrio.",
    duration: "1 hora 15 minutos",
    durationShort: "1h 15min",
    // No se ofrece en Las Vegas, solo en Miami.
    pricing: { miami: { price: "$250" } },
    paragraphs: [
      "Una experiencia que une la energía del Reiki con el poder envolvente del sonido y la vibración.",
      "Durante la sesión se utilizan diferentes técnicas de Reiki y sonoterapia, seleccionadas de acuerdo con las necesidades y el estado energético de cada persona.",
      "Las vibraciones de los instrumentos acompañan el trabajo energético, creando un espacio para aquietar la mente, liberar tensión y favorecer una sensación profunda de equilibrio y relajación.",
      "El sonido también acompaña la armonización de los chakras y permite cerrar la experiencia desde un estado de mayor presencia y conexión interior.",
    ],
    idealFor:
      "estrés cotidiano, cansancio mental, búsqueda de relajación profunda, equilibrio energético y personas que conectan especialmente con el sonido y la vibración.",
  },
  {
    id: "armonizacion-sonora-grupal",
    family: "sonoterapia",
    name: "Armonización Sonora Grupal",
    tags: ["Sonido", "Vibración", "Relajación", "Conexión"],
    shortDescription: "Una experiencia compartida de relajación y conexión a través del sonido y la vibración.",
    duration: "1 hora 15 minutos",
    durationShort: "1h 15min",
    // No se ofrece en Las Vegas, solo en Miami.
    pricing: {
      miami: { price: "$150 por persona", priceNote: "Mínimo: 2 personas" },
    },
    paragraphs: [
      "Una experiencia compartida de relajación y armonización a través del sonido y la vibración.",
      "Durante la sesión, los participantes se sumergen en un paisaje sonoro creado con diferentes instrumentos, vibraciones y frecuencias que acompañan un estado de relajación, presencia y conexión interior.",
      "El trabajo sonoro puede dirigirse también hacia la armonización de los chakras y del campo energético individual y grupal.",
      "Compartir la experiencia permite crear un espacio diferente de conexión, en el que cada participante vive su propio proceso mientras forma parte de una misma experiencia sonora.",
    ],
    idealFor:
      "parejas, familias, amigos, pequeños grupos, equipos o personas que desean compartir una experiencia consciente de bienestar, relajación y conexión.",
  },
  {
    id: "espacio-en-armonia",
    family: "espacios",
    name: "Espacio en Armonía",
    tags: ["Lectura", "Limpieza energética", "Canalización"],
    shortDescription: "Lectura, limpieza energética y canalización para renovar la energía de tu hogar o negocio.",
    duration: "Se determina según el espacio",
    durationShort: "A definir",
    // TODO: confirmar precio real de Miami — por ahora usa el mismo que antes.
    pricing: { "las-vegas": { price: "Desde $350" }, miami: { price: "Desde $500" } },
    paragraphs: [
      "Los espacios también guardan historias.",
      "Mudanzas, discusiones, períodos difíciles, cambios de propietarios, alta circulación de personas o simplemente el paso del tiempo pueden hacer que determinados lugares se perciban pesados, incómodos o estancados.",
      "El proceso comienza con una lectura energética del espacio para identificar las áreas que requieren mayor atención.",
      "Posteriormente se realiza una limpieza orientada a liberar energías estancadas y recuperar una sensación de armonía, equilibrio y fluidez dentro del lugar.",
      "Cuando el proceso lo requiere, puede incorporarse canalización o conexión espiritual como parte de la lectura y armonización.",
      "El servicio puede realizarse en casas, apartamentos, oficinas, locales comerciales y negocios.",
      "La inversión comienza en $500. Tanto el precio final como la duración de la experiencia se determinan de manera personalizada, teniendo en cuenta las dimensiones del espacio, el trabajo energético requerido y la distancia de traslado hasta la ubicación.",
    ],
    idealFor:
      "mudanzas, apertura de negocios, cambios importantes, renovación de hogares y lugares de trabajo o espacios que se perciben energéticamente cargados.",
  },
];

// TODO: reemplazar con testimonios reales de clientes
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "María G.",
    quote:
      "Cada sesión de Reiki con RenaSER ha sido transformadora. Salgo con una sensación de paz que dura días.",
  },
  {
    id: "2",
    name: "Carlos R.",
    quote:
      "El masaje terapéutico me ayudó a liberar una tensión que cargaba desde hace meses. Un espacio de verdad sanador.",
  },
  {
    id: "3",
    name: "Ana P.",
    quote:
      "Un trato cálido y profesional desde el primer momento. Recomiendo totalmente las sesiones de sanación energética.",
  },
  {
    id: "4",
    name: "Luis M.",
    quote:
      "La sesión de Reiki + Mediumnidad fue una experiencia que no esperaba. Salí con mucha más claridad sobre decisiones que llevaba meses postergando.",
  },
  {
    id: "5",
    name: "Patricia D.",
    quote:
      "Llevé a mi hija a la meditación infantil y desde entonces duerme mucho mejor. Un espacio hermoso y cuidado en cada detalle.",
  },
];

// Política de depósito y cancelación — se reutiliza en el FAQ y como
// recordatorio corto junto a los botones de reserva.
export const CANCELLATION_POLICY = {
  depositPercent: "50%",
  windowHours: 48,
  shortNote:
    "Al reservar se cobra un depósito del 50% con tarjeta. Cancelaciones o cambios con menos de 48 horas de anticipación no son reembolsables.",
};

export const FAQ: FAQItem[] = [
  {
    question: "¿Qué puedo experimentar durante una terapia?",
    answer: [
      "Cada persona y cada proceso son diferentes. No existe una única manera de experimentar una sesión.",
      "Algunas personas alcanzan un estado de relajación profunda, mientras que otras pueden experimentar emociones, ganas de llorar, sensaciones de frío o calor, hormigueo o simplemente una sensación de calma y descanso. También es completamente normal no experimentar sensaciones particulares.",
      "Lo importante es permitirte vivir la experiencia sin expectativas y darle espacio a tu propio proceso.",
    ],
  },
  {
    question: "¿Cómo debo prepararme y vestirme para mi terapia?",
    answer: [
      "Te recomendamos venir con ropa cómoda y preferiblemente holgada, que te permita relajarte durante toda la experiencia. Los pantalones y las prendas en colores claros son una excelente opción. Antes de comenzar te pediremos retirar joyas, relojes y otros accesorios para que puedas recibir la terapia con mayor comodidad y sin interferencias durante el trabajo energético.",
      "También te recomendamos que tu última comida sea al menos 2 horas antes de la sesión y que ese día prefieras comidas ligeras. Sugerimos llegar con tiempo y con disposición para relajarte y vivir la experiencia sin expectativas.",
    ],
  },
  {
    question: "¿Cada cuánto tiempo puedo repetir una terapia o combinar varias?",
    answer: [
      "Generalmente recomendamos dejar entre 2 y 3 semanas entre sesiones, dependiendo de la terapia y de tu proceso individual. Este tiempo permite dar espacio a la integración de la experiencia antes de realizar un nuevo trabajo energético; tu terapeuta podrá orientarte sobre el tiempo más adecuado para ti después de cada sesión.",
      "Sí puedes combinar diferentes terapias — de hecho, algunas se complementan entre sí — pero no recomendamos combinar todas las experiencias al mismo tiempo. El trabajo energético también necesita tiempo y espacio para integrarse, y realizar demasiados procesos simultáneamente puede generar una sensación de sobrecarga. Si deseas experimentar más de una terapia, podemos orientarte sobre cuáles se complementan mejor y en qué orden realizarlas.",
    ],
  },
  {
    question: "¿Hay restricciones de edad o embarazo para recibir las terapias?",
    answer: [
      "Por protocolo de Renaser, no realizamos estas terapias durante los primeros 3 meses de embarazo. Si estás embarazada o existe la posibilidad de que puedas estarlo, es importante comunicárnoslo antes de reservar — a partir del segundo trimestre podremos valorar contigo qué experiencias son apropiadas y realizar las adaptaciones necesarias. Ante cualquier condición particular del embarazo, recomendamos consultar previamente con tu profesional de salud.",
      "Además, actualmente las experiencias y terapias ofrecidas por Renaser están disponibles exclusivamente para personas mayores de 18 años.",
    ],
  },
  {
    question: "¿Cómo sé qué terapia es mejor para mí?",
    answer: [
      "Cada una de nuestras terapias incluye una sección \"Ideal para…\" que puede ayudarte a identificar cuál se acerca más a lo que estás buscando.",
      "Pero también creemos que elegir una terapia tiene una parte intuitiva. Lee las diferentes experiencias con calma y observa cuál resuena contigo, cuál despierta tu curiosidad o hacia cuál te sientes naturalmente atraído/a.",
      "Y si todavía tienes dudas, puedes conversar con nosotros antes de reservar. Te ayudaremos a conocer mejor las opciones para que puedas elegir la experiencia que más conecte contigo y con el momento que estás viviendo.",
    ],
  },
  {
    question: "¿Cómo funciona el pago y la política de cancelación?",
    answer: [
      "Al reservar tu sesión se cobra un depósito del 50% del valor de la terapia con tarjeta, a través de nuestra plataforma de pagos segura. El resto se abona el día de la sesión.",
      "Si necesitas cancelar o reprogramar, puedes hacerlo sin costo hasta 48 horas antes de tu cita. Pasado ese plazo, o en caso de no presentarte (no-show), el depósito no es reembolsable, ya que ese horario queda reservado exclusivamente para ti.",
      "Si tienes dudas sobre tu reserva o necesitas reprogramar, escríbenos con anticipación y con gusto te ayudamos a encontrar un nuevo horario.",
    ],
  },
];
