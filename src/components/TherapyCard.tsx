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

  return (
    <div ref={ref} className={`${styles.card} reveal`} data-location={location}>
      <div className={styles.leafMark} aria-hidden="true" />
      <h3>{therapy.name}</h3>
      <ul className={styles.tags}>
        {therapy.tags.slice(0, 4).map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <span className={styles.meta}>
        {therapy.durationShort} · {pricing.price}
      </span>

      <div className={styles.actions}>
        <button type="button" className={styles.detailLink} onClick={() => setOpen(true)}>
          Ver más
        </button>
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
