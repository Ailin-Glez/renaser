import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { LocationKey, Therapy } from "../data/content";
import { BOOKING_ENABLED, CAL_USERNAME, DEFAULT_DISCLAIMER, SITE, calSlugFor } from "../data/content";
import { openBookingModal } from "../lib/cal";
import styles from "./TherapyModal.module.css";

interface TherapyModalProps {
  therapy: Therapy;
  location: LocationKey;
  onClose: () => void;
}

export function TherapyModal({ therapy, location, onClose }: TherapyModalProps) {
  const pricing = therapy.pricing[location];
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

  if (!pricing) return null;

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

        <div className={styles.header}>
          <h3 className={styles.name}>{therapy.name}</h3>
          <p className={styles.tags}>{therapy.tags.join(" · ")}</p>

          <div className={styles.meta}>
            <span>
              <strong>Duración:</strong> {therapy.duration}
            </span>
            <span>
              <strong>Inversión:</strong> {pricing.price}
            </span>
          </div>
          {pricing.priceNote && <p className={styles.priceNote}>{pricing.priceNote}</p>}
          {pricing.depositPrice ? (
            <p className={styles.depositNote}>
              🔒 Depósito al reservar: <strong>{pricing.depositPrice}</strong> — el resto se paga el día de la
              sesión.
            </p>
          ) : (
            therapy.manualDeposit && (
              <p className={styles.depositNote}>
                📝 El depósito de esta experiencia se coordina directamente contigo antes de tu sesión.
              </p>
            )
          )}

          {BOOKING_ENABLED ? (
            <button
              type="button"
              className={styles.bookButton}
              onClick={() => openBookingModal(`${CAL_USERNAME}/${calSlugFor(therapy.id, location)}`)}
            >
              Reservar esta sesión
            </button>
          ) : (
            <div className={styles.bookingClosed}>
              <p>Las reservas en línea estarán disponibles muy pronto.</p>
              <a
                href={`https://wa.me/${SITE.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className={styles.bookButton}
              >
                Escríbenos por WhatsApp
              </a>
            </div>
          )}
        </div>

        <div className={styles.scrollArea}>
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

          <p className={styles.disclaimer}>{therapy.disclaimer ?? DEFAULT_DISCLAIMER}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
