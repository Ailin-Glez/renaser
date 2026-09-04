import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Foto guardada como data URL dentro del propio documento de Firestore,
// para no depender de un plan pago de Storage. A este tamaño/calidad
// una foto pesa ~150-250KB en base64, muy por debajo del límite de 1MB
// por documento — deja margen de sobra.
const PHOTO_MAX_SIZE = 720;
const PHOTO_QUALITY = 0.85;

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

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  photoUrl?: string;
  alerts?: string; // notas: contraindicaciones, embarazo, alergias, etc.
  createdAt?: Timestamp;
}

export interface Visit {
  id: string;
  date: string; // YYYY-MM-DD
  therapyId?: string;
  therapyName: string;
  therapist?: string;
  notes?: string;
  recommendations?: string; // recomendaciones para el paciente tras esta visita
  createdAt?: Timestamp;
}

const patientsRef = collection(db, "patients");

export async function listPatients(): Promise<Patient[]> {
  const snap = await getDocs(query(patientsRef, orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Patient, "id">) }));
}

export async function getPatient(id: string): Promise<Patient | null> {
  const snap = await getDoc(doc(db, "patients", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Patient, "id">) };
}

export async function createPatient(data: {
  name: string;
  phone?: string;
  alerts?: string;
  photoFile?: File;
}): Promise<string> {
  const photoUrl = data.photoFile ? await resizePhotoToDataUrl(data.photoFile) : "";
  const docRef = await addDoc(patientsRef, {
    name: data.name,
    phone: data.phone ?? "",
    alerts: data.alerts ?? "",
    photoUrl,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updatePatient(
  id: string,
  data: { name?: string; phone?: string; alerts?: string; photoFile?: File }
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.phone !== undefined) updates.phone = data.phone;
  if (data.alerts !== undefined) updates.alerts = data.alerts;

  if (data.photoFile) {
    updates.photoUrl = await resizePhotoToDataUrl(data.photoFile);
  }

  await updateDoc(doc(db, "patients", id), updates);
}

export async function deletePatient(id: string): Promise<void> {
  await deleteDoc(doc(db, "patients", id));
}

function visitsRef(patientId: string) {
  return collection(db, "patients", patientId, "visits");
}

export async function listVisits(patientId: string): Promise<Visit[]> {
  const snap = await getDocs(query(visitsRef(patientId), orderBy("date", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Visit, "id">) }));
}

export async function addVisit(
  patientId: string,
  data: {
    date: string;
    therapyId?: string;
    therapyName: string;
    therapist?: string;
    notes?: string;
    recommendations?: string;
  }
): Promise<string> {
  const docRef = await addDoc(visitsRef(patientId), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateVisit(
  patientId: string,
  visitId: string,
  data: Partial<Pick<Visit, "date" | "therapyId" | "therapyName" | "therapist" | "notes" | "recommendations">>
): Promise<void> {
  await updateDoc(doc(db, "patients", patientId, "visits", visitId), data);
}

export async function deleteVisit(patientId: string, visitId: string): Promise<void> {
  await deleteDoc(doc(db, "patients", patientId, "visits", visitId));
}
