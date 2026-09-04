import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { submitReview } from "../lib/reviews";
import styles from "./ReviewFormModal.module.css";

const QUOTE_MAX = 500;

export function ReviewFormModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;

    setStatus("sending");
    try {
      await submitReview({ name, quote });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Dejar una reseña"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        {status === "sent" ? (
          <div className={styles.thanks}>
            <span className={styles.thanksMark} aria-hidden="true" />
            <h3>¡Gracias por tu reseña!</h3>
            <p>La leeremos con cariño. Una vez aprobada, aparecerá en el sitio.</p>
          </div>
        ) : (
          <>
            <h3 className={styles.title}>Comparte tu experiencia</h3>
            <p className={styles.subtitle}>
              Tu reseña será revisada antes de publicarse en el sitio.
            </p>

            <form onSubmit={handleSubmit}>
              <label className={styles.label} htmlFor="review-name">
                Tu nombre
              </label>
              <input
                id="review-name"
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. María G."
                maxLength={60}
                required
              />

              <label className={styles.label} htmlFor="review-quote">
                Tu reseña
              </label>
              <textarea
                id="review-quote"
                className={styles.textarea}
                value={quote}
                onChange={(e) => setQuote(e.target.value.slice(0, QUOTE_MAX))}
                placeholder="Contanos cómo fue tu experiencia…"
                rows={5}
                required
              />
              <span className={styles.counter}>
                {quote.length}/{QUOTE_MAX}
              </span>

              {status === "error" && (
                <p className={styles.errorNote}>
                  Algo salió mal al enviar tu reseña. Por favor, intenta de nuevo.
                </p>
              )}

              <button type="submit" className={styles.submitButton} disabled={status === "sending"}>
                {status === "sending" ? "Enviando…" : "Enviar reseña"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
