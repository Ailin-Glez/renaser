import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Therapy } from "../data/content";
import { CAL_USERNAME } from "../data/content";
import { CAL_NAMESPACE } from "../lib/cal";
import styles from "./TherapyModal.module.css";

interface TherapyModalProps {
  therapy: Therapy;
  onClose: () => void;
}

export function TherapyModal({ therapy, onClose }: TherapyModalProps) {
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

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={therapy.name}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <h3 className={styles.name}>{therapy.name}</h3>
        <p className={styles.tags}>{therapy.tags.join(" · ")}</p>

        <div className={styles.meta}>
          <span>
            <strong>Duración:</strong> {therapy.duration}
          </span>
          <span>
            <strong>Inversión:</strong> {therapy.price}
          </span>
        </div>
        {therapy.priceNote && <p className={styles.priceNote}>{therapy.priceNote}</p>}

        <div className={styles.body}>
          {therapy.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {therapy.list && (
            <ul className={styles.list}>
              {therapy.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>

        <p className={styles.idealFor}>
          <strong>Ideal para:</strong> {therapy.idealFor}
        </p>

        {therapy.disclaimer && <p className={styles.disclaimer}>{therapy.disclaimer}</p>}

        <button
          type="button"
          className={styles.bookButton}
          data-cal-namespace={CAL_NAMESPACE}
          data-cal-link={`${CAL_USERNAME}/${therapy.id}`}
        >
          Reservar esta sesión
        </button>
      </div>
    </div>,
    document.body
  );
}
