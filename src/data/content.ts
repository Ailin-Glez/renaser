// ─────────────────────────────────────────────────────────────
// CONTENIDO PLACEHOLDER — reemplaza todo lo marcado con TODO
// Este es el único archivo que necesitas editar para actualizar
// los textos, terapias, testimonios y enlaces del sitio.
// ─────────────────────────────────────────────────────────────

export interface Therapy {
  id: string;
  name: string;
  duration: string;
  description: string;
  featured?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
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
    "Un espacio donde el Reiki se encuentra con la mediumnidad,\ny el cuidado del cuerpo con el del alma.",
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
  dateRange: "27 de agosto – 13 de septiembre",
  note: "Reserva con antelación.",
};

// Texto de misión/filosofía de marca — usado en la sección "Filosofía" del Inicio
export const MISSION_TEXT =
  "RenaSER nace de una idea sencilla: el bienestar no es solamente cuidar el cuerpo. Es nutrirlo, recuperar energía, cuidar la mente y encontrar equilibrio — pequeños rituales que te hagan sentir bien por dentro y por fuera. Porque cuidarte no debería sentirse como otra obligación. Debería convertirse en una forma de vivir.";

// Cita de cierre para la página "Sobre mí"
export const ABOUT_QUOTE = [
  "El despertar duele. Duele porque empiezas a ver lo que antes ignorabas, porque reconoces heridas, patrones y vínculos que ya no puedes seguir sosteniendo.",
  "No todos entenderán tu despertar, porque no todos han recorrido tu camino.",
  "Sigue sanando. Sigue creciendo. Sigue eligiéndote.",
];

export const ABOUT_TEXT = [
  "No nací para pertenecer a un solo mundo. Desde niña supe que algo en mí se extendía más allá de lo visible, que podía escuchar lo que no se decía y sentir lo que no se tocaba. Con el tiempo entendí que soy un puente: un canal entre el cielo y la tierra, entre lo divino y lo humano.",
  "No vivo separando ambos planos, sino unificándolos. Mi alma se eleva para escuchar a los guías y a los seres de luz, pero mis pies permanecen firmes sobre el suelo, recordándome que la verdadera espiritualidad florece en lo cotidiano, en el abrazo, en la palabra, en la presencia.",
  "A veces viajo a través del silencio, otras a través del dolor de quienes me buscan. Los acompaño sin prometer milagros, solo recordándoles que el milagro está en ellos.",
  "Sano no desde el poder, sino desde la entrega. Sirvo porque servir es mi forma de orar. Y cada vez que un alma se reconcilia consigo misma, siento que una parte del cielo se ancla un poco más en la tierra.",
  "Soy mujer, soy canal, soy guía y también aprendiz. Soy el punto donde se encuentran el espíritu y la materia. Y mientras respire, seguiré tendiendo puentes de luz, de amor y de conciencia para que más corazones recuerden quiénes son en verdad.",
  "Me formé como terapeuta en LNT porque sentí el llamado de ir más allá de lo superficial: aprender a leer el lenguaje sutil del cuerpo, de las emociones y del espíritu, en vez de conformarme con calmar síntomas. Cada sesión es, para mí, un acto sagrado — un espacio de escucha profunda y reparación interior.",
];

export const THERAPIES: Therapy[] = [
  {
    id: "reiki-limpieza-energetica",
    name: "Reiki y Limpieza Energética",
    duration: "60 min",
    description: "Equilibra tu energía y libera cargas físicas y emocionales acumuladas.",
  },
  {
    id: "mediumnidad",
    name: "Mediumnidad",
    duration: "45 min",
    description: "Conexión con tus seres queridos y guías, con mensajes para tu alma.",
  },
  {
    id: "terapia-cuantica",
    name: "Terapia Cuántica y Energética",
    duration: "60 min",
    description: "Armoniza cuerpo, mente y campo energético.",
  },
  {
    id: "armonizacion-integral",
    name: "Armonización Cuerpo, Mente y Espíritu",
    duration: "75 min",
    description: "Bienestar integral y transformación.",
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
