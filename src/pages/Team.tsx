import carlosPortrait from "../assets/carlos-portrait.jpg";
import marthaPortrait from "../assets/martha-portrait.jpg";
import { THERAPISTS, SITE } from "../data/content";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { usePageMeta } from "../hooks/usePageMeta";
import styles from "./Team.module.css";

const PHOTOS: Record<string, string> = {
  carlos: carlosPortrait,
  martha: marthaPortrait,
};

function TherapistCard({ therapist }: { therapist: (typeof THERAPISTS)[number] }) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={`${styles.card} reveal`}>
      <div className={styles.leafMark} aria-hidden="true" />
      <div className={styles.sidebar}>
        <div className={styles.photoCol}>
          <div className={styles.photo}>
            <img src={PHOTOS[therapist.id]} alt={`${therapist.name}, terapeuta de ${SITE.name}`} />
          </div>
        </div>

        <div className={styles.formation}>
          <h3 className={styles.formationTitle}>Formación</h3>
          {therapist.formation.map((group, i) => (
            <div key={i} className={styles.formationGroup}>
              <span className={styles.formationGroupLabel}>{group.label}</span>
              <div className={styles.formationTags}>
                {group.items.map((item, j) => (
                  <span key={j} className={styles.formationTag}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <h2>{therapist.name}</h2>
        <p className={styles.title}>{therapist.title}</p>

        {therapist.bio.map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        {therapist.closing?.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

export default function Team() {
  usePageMeta(
    "Nuestro equipo",
    "Conoce a Carlos y Martha, terapeutas holísticos de RenaSER — Reiki, LNT, mediumnidad y sonoterapia."
  );

  return (
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

        {THERAPISTS.map((therapist) => (
          <TherapistCard key={therapist.id} therapist={therapist} />
        ))}
      </div>
    </section>
  );
}
