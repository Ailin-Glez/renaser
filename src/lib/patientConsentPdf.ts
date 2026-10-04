import jsPDF from "jspdf";
import logo from "../assets/renaser-logo.jpg";
import { US_STATES } from "./usStates";
import type { IntakeFormData } from "./intakeForms";

const PRECAUTION_FIELDS: { key: keyof Omit<IntakeFormData, "signatureDataUrl">; label: string }[] = [
  { key: "hasPacemaker", label: "Marcapasos o dispositivo médico electrónico implantado" },
  { key: "hasMetalImplants", label: "Implantes metálicos" },
  { key: "isPregnant", label: "Embarazo" },
  { key: "hasHeartCondition", label: "Condición cardíaca" },
  { key: "hasBloodPressureIssue", label: "Presión arterial alta o baja" },
  { key: "hasEpilepsy", label: "Epilepsia o convulsiones" },
  { key: "hasCancer", label: "Cáncer actual o en tratamiento" },
  { key: "hasDiabetes", label: "Diabetes" },
  { key: "hasPsychiatricCondition", label: "Trastorno psiquiátrico o psicológico actual" },
  { key: "hasChronicPain", label: "Dolor crónico" },
  { key: "hasRespiratoryIssue", label: "Problemas respiratorios / asma" },
];

// El logo se importa como ruta de asset (no como data URL), así que hay que
// convertirlo una vez a base64 para poder embeberlo en el PDF con jsPDF.
let logoDataUrlPromise: Promise<string | null> | null = null;
export function getLogoDataUrl(): Promise<string | null> {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch(logo)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          })
      )
      .catch(() => null);
  }
  return logoDataUrlPromise;
}

export function generateConsentPdf(
  data: Omit<IntakeFormData, "signatureDataUrl">,
  signatureDataUrl: string,
  photoDataUrl: string | null,
  logoDataUrl: string | null
): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function ensureSpace(lines: number, lineHeight = 14) {
    if (y + lines * lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function ensurePixelSpace(height: number) {
    if (y + height > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  let firstSection = true;
  function heading(text: string) {
    if (!firstSection) {
      ensureSpace(2, 16);
      y += 8;
      doc.setDrawColor(222, 214, 194);
      doc.setLineWidth(0.6);
      doc.line(margin, y, margin + contentWidth, y);
      y += 20;
    }
    firstSection = false;
    ensureSpace(2, 22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(11, 77, 59);
    doc.text(text, margin, y);
    y += 20;
    doc.setTextColor(30, 30, 30);
  }

  function field(label: string, value?: string) {
    if (!value) return;
    const lines = doc.splitTextToSize(`${label}: ${value}`, contentWidth);
    ensureSpace(lines.length);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 4;
  }

  const headerTop = y;
  let titleX = margin;
  let logoBottom = headerTop;
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "JPEG", margin, headerTop, 54, 54);
      titleX = margin + 66;
      logoBottom = headerTop + 54;
    } catch {
      // si falla el formato de imagen, se omite sin romper el PDF
    }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(11, 77, 59);
  doc.text("RenaSER", titleX, headerTop + 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(70, 70, 70);
  doc.text("Ficha del Paciente y Consentimiento Informado", titleX, headerTop + 38);

  y = Math.max(logoBottom, headerTop + 38) + 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Generado el ${new Date().toLocaleString("es-ES")}`, margin, y);
  y += 26;

  if (photoDataUrl) {
    try {
      doc.addImage(photoDataUrl, "JPEG", pageWidth - margin - 70, margin, 70, 70);
    } catch {
      // si falla el formato de imagen, se omite sin romper el PDF
    }
  }

  if (data.therapyName) {
    const therapyLine = data.therapyLocation
      ? `Consentimiento para: ${data.therapyName} — ${data.therapyLocation}`
      : `Consentimiento para: ${data.therapyName}`;
    doc.setFillColor(244, 236, 219);
    doc.roundedRect(margin, y, contentWidth, 24, 6, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(11, 77, 59);
    doc.text(therapyLine, margin + 12, y + 16);
    y += 24 + 18;
  }

  heading("Información personal");
  field("Nombre completo", data.fullName);
  field("Teléfono", data.phone);
  field("Correo electrónico", data.email);
  field("Fecha de nacimiento", data.birthDate);
  field("Dirección", data.address);
  field("Ciudad", data.city);
  field("Estado", US_STATES.find((s) => s.code === data.state)?.name ?? data.state);
  field("Contacto de emergencia", data.emergencyContactName);
  field("Teléfono de emergencia", data.emergencyContactPhone);

  heading("Experiencia previa");
  field("¿Ha recibido antes terapias energéticas o sonoterapia?", data.hadPreviousTherapy ? "Sí" : "No");
  field("Detalles", data.previousTherapyDetails);

  heading("Salud general");
  field("Condiciones médicas actuales", data.currentConditions);
  field("Medicamentos y suplementos actuales", data.currentMedications);
  field("Cirugías, accidentes o lesiones relevantes", data.surgeriesOrInjuries);

  heading("Alergias y sensibilidades");
  field("Aceites esenciales", data.hasEssentialOilAllergy ? data.allergyEssentialOils || "Sí" : "No");
  field("Hierbas / plantas / flores", data.hasHerbsPlantsAllergy ? data.allergyHerbsPlants || "Sí" : "No");
  field("Sage, palo santo u otros humos", data.hasSageIncenseAllergy ? data.allergySageIncenseSmoke || "Sí" : "No");
  field("Fragancias / olores", data.hasFragranceAllergy ? data.allergyFragrances || "Sí" : "No");
  field("Otros", data.allergyOther);

  heading("Precauciones y antecedentes");
  for (const { key, label } of PRECAUTION_FIELDS) {
    field(label, data[key] ? "Sí" : "No");
  }
  if (data.isPregnant) field("Semanas de embarazo", data.pregnancyWeeks);
  field("Otra condición relevante", data.otherCondition);

  heading("Técnicas autorizadas");
  field("Técnicas", data.authorizedTechniques.join(", ") || "Ninguna seleccionada");
  field("Otra técnica", data.otherTechnique);

  heading("Terapeuta a cargo de la sesión");
  field(
    "Terapeuta",
    data.therapist === "ambos"
      ? "Martha González y Carlos Laurenti (trabajo en pareja)"
      : data.therapist === "martha"
        ? "Martha González"
        : "Carlos Laurenti"
  );

  // Separación extra antes del bloque de consentimiento, que lleva su
  // propio estilo (caja con fondo) para distinguirlo del resto de la ficha.
  ensureSpace(2, 16);
  y += 8;
  doc.setDrawColor(222, 214, 194);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + contentWidth, y);
  y += 22;

  const consentText =
    "El paciente declara que la información proporcionada es verdadera y completa, que ha informado sus " +
    "condiciones de salud, alergias y sensibilidades relevantes, y que entiende que estas terapias son " +
    "complementarias y no sustituyen el diagnóstico ni el tratamiento médico, psicológico o psiquiátrico. " +
    "Autoriza únicamente las técnicas seleccionadas y da voluntariamente su consentimiento para recibirlas.";
  const boxPadding = 16;
  const consentLines = doc.splitTextToSize(consentText, contentWidth - boxPadding * 2);
  const boxHeight = 28 + consentLines.length * 13 + boxPadding;

  ensurePixelSpace(boxHeight);
  const boxTop = y;
  doc.setFillColor(244, 236, 219);
  doc.roundedRect(margin, boxTop, contentWidth, boxHeight, 8, 8, "F");
  doc.setFillColor(11, 77, 59);
  doc.roundedRect(margin, boxTop, 5, boxHeight, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(11, 77, 59);
  doc.text("Consentimiento informado", margin + boxPadding, boxTop + boxPadding + 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);
  doc.text(consentLines, margin + boxPadding, boxTop + boxPadding + 20);

  y = boxTop + boxHeight + 24;

  ensureSpace(10, 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text("Firma:", margin, y);
  try {
    doc.addImage(signatureDataUrl, "PNG", margin, y + 8, 180, 60);
  } catch {
    // si falla el formato de imagen, se omite sin romper el PDF
  }

  return doc;
}
