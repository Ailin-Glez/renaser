import { useState } from "react";
import carlosPortrait from "../assets/carlos-portrait.jpg";
import marthaPortrait from "../assets/martha-portrait.jpg";
import { THERAPISTS, SITE } from "../data/content";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Team.module.css";

const PHOTOS: Record<string, string> = {
  carlos: carlosPortrait,
  martha: marthaPortrait,
};

function TherapistSection({ therapist }: { therapist: (typeof THERAPISTS)[number] }) {
  const ref = useScrollReveal<HTMLDivElement>();
  const [expanded, setExpanded] = useState(false);
  const [firstParagraph, ...restParagraphs] = therapist.bio;

  return (
    <div ref={ref} className={`${styles.info} reveal`}>
      <h2>{therapist.name}</h2>
      <p className={styles.title}>{therapist.title}</p>

      <p>{firstParagraph}</p>

      <div className={styles.moreWrap} data-open={expanded}>
        <div className={styles.more}>
          <div className={styles.moreInner}>
            {restParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <h3 className={styles.formationTitle}>Mi formación</h3>
            <div className={styles.formationTags}>
              {therapist.formation.map((item, i) => (
                <span key={i} className={styles.formationTag}>
                  {item}
                </span>
              ))}
            </div>

            {therapist.closing?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      <button type="button" className={styles.moreButton} onClick={() => setExpanded((v) => !v)}>
        {expanded ? "Ver menos" : "Ver más"}
        <span className={`${styles.moreIcon} ${expanded ? styles.moreIconOpen : ""}`} aria-hidden="true">
          ↓
        </span>
      </button>
    </div>
  );
}

export default function Team() {
  return (
    <>
      <section className={styles.section}>
        <div className="container">
          <div className={styles.intro}>
            <span className={styles.eyebrow}>Nuestro equipo</span>
            <h1 className={styles.pageTitle}>Conoce tus terapeutas</h1>
            <p className={styles.introText}>
              Dos caminos distintos, una misma intención: acompañarte con presencia, cercanía y respeto por tu
              propio proceso.
            </p>
          </div>

          <div className={styles.duo}>
            {THERAPISTS.map((therapist) => (
              <div key={therapist.id} className={styles.duoPerson}>
                <div className={styles.duoPhoto}>
                  <img src={PHOTOS[therapist.id]} alt={`${therapist.name}, terapeuta de ${SITE.name}`} />
                </div>
                <span className={styles.duoName}>{therapist.name}</span>
              </div>
            ))}
          </div>

          {THERAPISTS.map((therapist) => (
            <TherapistSection key={therapist.id} therapist={therapist} />
          ))}
        </div>
      </section>
    </>
  );
}
