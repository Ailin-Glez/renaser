import { SectionHeading } from "../components/SectionHeading";
import { TherapyCard } from "../components/TherapyCard";
import { POPUP_EVENT, SITE, THERAPIES } from "../data/content";
import styles from "./Home.module.css";

export default function Therapies() {
  return (
    <section className={styles.section} style={{ paddingTop: 64 }}>
      <div className="container">
        <SectionHeading
          eyebrow="Terapias"
          title="Terapias Holísticas"
          description="Explora las distintas modalidades y elige la que mejor acompañe tu momento actual."
        />

        {POPUP_EVENT.active && (
          <p className={styles.popupNote}>
            📍 Sesiones en <strong>{POPUP_EVENT.city}</strong>: {POPUP_EVENT.dateRange}. {POPUP_EVENT.note}
          </p>
        )}

        <div className={styles.grid}>
          {THERAPIES.map((therapy) => (
            <TherapyCard key={therapy.id} therapy={therapy} />
          ))}
        </div>

        <p className={styles.note}>
          ¿Prefieres coordinar directamente? Escríbenos a {SITE.email} o llámanos al {SITE.phone}.
        </p>
      </div>
    </section>
  );
}
