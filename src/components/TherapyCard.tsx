import { useState } from "react";
import { CAL_USERNAME } from "../data/content";
import type { Therapy } from "../data/content";
import { CAL_NAMESPACE } from "../lib/cal";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { TherapyModal } from "./TherapyModal";
import styles from "./TherapyCard.module.css";

export function TherapyCard({ therapy }: { therapy: Therapy }) {
  const ref = useScrollReveal<HTMLDivElement>();
  const [open, setOpen] = useState(false);

  return (
    <div ref={ref} className={`${styles.card} reveal`}>
      <div className={styles.leafMark} aria-hidden="true" />
      <h3>{therapy.name}</h3>
      <p>{therapy.shortDescription}</p>
      <span className={styles.meta}>
        {therapy.durationShort} · {therapy.price}
      </span>
      <div className={styles.actions}>
        <button type="button" className={styles.detailLink} onClick={() => setOpen(true)}>
          Conocer la experiencia
        </button>
        <button
          type="button"
          className={styles.bookButton}
          data-cal-namespace={CAL_NAMESPACE}
          data-cal-link={`${CAL_USERNAME}/${therapy.id}`}
        >
          Reservar
        </button>
      </div>

      {open && <TherapyModal therapy={therapy} onClose={() => setOpen(false)} />}
    </div>
  );
}
