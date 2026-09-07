import { useState } from "react";
import { CAL_USERNAME, calSlugFor } from "../data/content";
import type { LocationKey, Therapy } from "../data/content";
import { CAL_NAMESPACE } from "../lib/cal";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { TherapyModal } from "./TherapyModal";
import styles from "./TherapyCard.module.css";

export function TherapyCard({ therapy, location }: { therapy: Therapy; location: LocationKey }) {
  const ref = useScrollReveal<HTMLDivElement>();
  const [open, setOpen] = useState(false);
  const pricing = therapy.pricing[location];
  if (!pricing) return null;

  return (
    <div ref={ref} className={`${styles.card} reveal`} data-location={location}>
      <div className={styles.leafMark} aria-hidden="true" />

      <button type="button" className={styles.clickable} onClick={() => setOpen(true)}>
        <h3>{therapy.name}</h3>
        <ul className={styles.tags}>
          {therapy.tags.slice(0, 4).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <span className={styles.meta}>
          {therapy.durationShort} · {pricing.price}
        </span>
        <span className={styles.more}>
          Ver más <span aria-hidden="true">→</span>
        </span>
      </button>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.bookButton}
          data-cal-namespace={CAL_NAMESPACE}
          data-cal-link={`${CAL_USERNAME}/${calSlugFor(therapy.id, location)}`}
        >
          Reservar
        </button>
      </div>

      {open && <TherapyModal therapy={therapy} location={location} onClose={() => setOpen(false)} />}
    </div>
  );
}
