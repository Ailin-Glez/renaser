import { Link } from "react-router-dom";
import type { Family } from "../data/content";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./FamilyCard.module.css";

export function FamilyCard({ family }: { family: Family }) {
  const ref = useScrollReveal<HTMLAnchorElement>();

  return (
    <Link to={`/terapias#${family.key}`} ref={ref} className={`${styles.card} reveal`}>
      <div className={styles.leafMark} aria-hidden="true" />
      <h3>{family.name}</h3>
      <p>{family.teaser}</p>
      <span className={styles.link}>
        Ver terapias <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
