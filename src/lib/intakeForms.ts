import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Foto opcional guardada como data URL dentro del propio documento, igual
// que en patients.ts — para no depender de un plan pago de Storage.
const PHOTO_MAX_SIZE = 480;
const PHOTO_QUALITY = 0.82;

function resizePhotoToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, PHOTO_MAX_SIZE / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export type TherapistChoice = "martha" | "carlos" | "ambos";

export interface IntakeFormData {
  // Terapia por la que se firma este consentimiento (si se llegó desde
  // "Reservar" en una terapia específica) — se guarda el nombre ya resuelto,
  // no solo el id, para que el PDF no dependa de que la terapia siga
  // existiendo igual en content.ts más adelante.
  therapyName?: string;
  therapyLocation?: string;

  // Información personal
  fullName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  state?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Experiencia previa
  hadPreviousTherapy: boolean;
  previousTherapyDetails?: string;

  // Salud general
  currentConditions?: string;
  currentMedications?: string;
  surgeriesOrInjuries?: string;

  // Alergias y sensibilidades (true = sí tiene esa alergia)
  hasEssentialOilAllergy: boolean;
  allergyEssentialOils?: string;
  hasHerbsPlantsAllergy: boolean;
  allergyHerbsPlants?: string;
  hasSageIncenseAllergy: boolean;
  allergySageIncenseSmoke?: string;
  hasFragranceAllergy: boolean;
  allergyFragrances?: string;
  allergyOther?: string;

  // Precauciones y antecedentes (true = sí)
  hasPacemaker: boolean;
  hasMetalImplants: boolean;
  isPregnant: boolean;
  pregnancyWeeks?: string;
  hasHeartCondition: boolean;
  hasBloodPressureIssue: boolean;
  hasEpilepsy: boolean;
  hasCancer: boolean;
  hasDiabetes: boolean;
  hasPsychiatricCondition: boolean;
  hasChronicPain: boolean;
  hasRespiratoryIssue: boolean;
  otherCondition?: string;

  // Técnicas autorizadas
  authorizedTechniques: string[];
  otherTechnique?: string;

  therapist: TherapistChoice;

  consentAccepted: boolean;
  signatureDataUrl: string;
  photoUrl?: string;
}

export interface IntakeFormSubmission extends IntakeFormData {
  id: string;
  processed: boolean;
  // Id del Patient al que quedó vinculada esta ficha (al crear un paciente
  // nuevo o actualizar uno existente desde esta ficha) — permite al admin
  // regenerar el PDF de consentimiento desde la ficha del paciente.
  linkedPatientId?: string;
  createdAt?: Timestamp;
}

const intakeFormsRef = collection(db, "intakeForms");

// Firestore rechaza cualquier campo con valor `undefined` (campos opcionales
// que el paciente dejó vacíos) — se filtran antes de escribir.
function stripUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as Partial<T>;
}

// Pública: cualquier visitante con el link puede crear su ficha. Las reglas
// de Firestore deben permitir "create" en esta colección sin permitir "list"
// ni "get" públicos (igual que reviews.ts), para que sea prueba de
// consentimiento privada y no un listado público.
export async function submitIntakeForm(
  data: IntakeFormData & { photoFile?: File }
): Promise<string> {
  const { photoFile, ...rest } = data;
  const photoUrl = photoFile ? await resizePhotoToDataUrl(photoFile) : undefined;

  const docRef = await addDoc(intakeFormsRef, {
    ...stripUndefined(rest),
    photoUrl: photoUrl ?? null,
    processed: false,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

// Admin: todas las fichas recibidas, más recientes primero. Se ordena en el
// cliente (en vez de con orderBy en la consulta) para no depender de un
// índice compuesto en Firestore.
export async function listIntakeForms(): Promise<IntakeFormSubmission[]> {
  const snap = await getDocs(query(intakeFormsRef));
  const forms = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<IntakeFormSubmission, "id">) }));
  return forms.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
}

export async function getIntakeForm(id: string): Promise<IntakeFormSubmission | null> {
  const snap = await getDoc(doc(db, "intakeForms", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<IntakeFormSubmission, "id">) };
}

// Vincula esta ficha con el Patient que se creó/actualizó a partir de ella,
// y la marca como procesada.
export async function linkIntakeFormToPatient(id: string, patientId: string): Promise<void> {
  await updateDoc(doc(db, "intakeForms", id), { linkedPatientId: patientId, processed: true });
}

export async function deleteIntakeForm(id: string): Promise<void> {
  await deleteDoc(doc(db, "intakeForms", id));
}
