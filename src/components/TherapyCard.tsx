import { CAL_USERNAME } from "../data/content";
import type { Therapy } from "../data/content";
import { CAL_NAMESPACE } from "../lib/cal";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./TherapyCard.module.css";

export function TherapyCard({ therapy }: { therapy: Therapy }) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={`${styles.card} ${therapy.featured ? styles.featured : ""} reveal`}>
      <div className={styles.leafMark} aria-hidden="true" />
      {therapy.featured && <span className={styles.badge}>Experiencia insignia</span>}
      <div className={styles.cardHeader}>
        <h3>{therapy.name}</h3>
        <span className={styles.duration}>{therapy.duration}</span>
      </div>
      <p>{therapy.description}</p>
      <button
        type="button"
        className={styles.bookButton}
        data-cal-namespace={CAL_NAMESPACE}
        data-cal-link={`${CAL_USERNAME}/${therapy.id}`}
      >
        Reservar esta sesión
      </button>
    </div>
  );
}
