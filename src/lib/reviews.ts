import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  name: string;
  quote: string;
  status: ReviewStatus;
  createdAt?: Timestamp;
}

const reviewsRef = collection(db, "reviews");

// Pública: cualquier visitante puede crear una reseña, siempre en estado "pending".
// La escritura real solo puede completarse si las reglas de Firestore permiten
// create con status == "pending" (ver README para el snippet de reglas).
export async function submitReview(data: { name: string; quote: string }): Promise<string> {
  const docRef = await addDoc(reviewsRef, {
    name: data.name.trim(),
    quote: data.quote.trim(),
    status: "pending" as ReviewStatus,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Admin: todas las reseñas, más recientes primero.
export async function listReviews(): Promise<Review[]> {
  const snap = await getDocs(query(reviewsRef, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) }));
}

// Pública: solo las reseñas ya aprobadas, para mostrar en el sitio.
// Se ordena en el cliente (en vez de con orderBy en la consulta) para no
// depender de un índice compuesto en Firestore.
export async function listApprovedReviews(): Promise<Review[]> {
  const snap = await getDocs(query(reviewsRef, where("status", "==", "approved")));
  const reviews = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) }));
  return reviews.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  await updateDoc(doc(db, "reviews", id), { status });
}

export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, "reviews", id));
}
