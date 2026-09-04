import { useEffect, useState } from "react";
import { deleteReview, listReviews, setReviewStatus, type Review, type ReviewStatus } from "../../lib/reviews";
import styles from "./ReviewsQueue.module.css";

const FILTERS: { key: ReviewStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobadas" },
  { key: "rejected", label: "Rechazadas" },
  { key: "all", label: "Todas" },
];

export default function ReviewsQueue() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    listReviews()
      .then(setReviews)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function updateStatus(id: string, status: ReviewStatus) {
    setBusyId(id);
    try {
      await setReviewStatus(id, status);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta reseña permanentemente?")) return;
    setBusyId(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div className={styles.toolbar}>
        <h1>Reseñas</h1>
      </div>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`${styles.filterButton} ${filter === f.key ? styles.filterActive : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === "pending" && pendingCount > 0 && <span className={styles.badge}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      {loading && <p className={styles.empty}>Cargando…</p>}

      {!loading && filtered.length === 0 && <p className={styles.empty}>No hay reseñas en esta categoría.</p>}

      <div className={styles.list}>
        {filtered.map((review) => (
          <div key={review.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.name}>{review.name}</span>
              <span className={`${styles.status} ${styles[review.status]}`}>
                {review.status === "pending" && "Pendiente"}
                {review.status === "approved" && "Aprobada"}
                {review.status === "rejected" && "Rechazada"}
              </span>
            </div>
            <p className={styles.quote}>{review.quote}</p>
            <div className={styles.actions}>
              {review.status !== "approved" && (
                <button
                  type="button"
                  className={styles.approveButton}
                  disabled={busyId === review.id}
                  onClick={() => updateStatus(review.id, "approved")}
                >
                  Aprobar
                </button>
              )}
              {review.status !== "rejected" && (
                <button
                  type="button"
                  className={styles.rejectButton}
                  disabled={busyId === review.id}
                  onClick={() => updateStatus(review.id, "rejected")}
                >
                  Rechazar
                </button>
              )}
              <button
                type="button"
                className={styles.deleteButton}
                disabled={busyId === review.id}
                onClick={() => remove(review.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
