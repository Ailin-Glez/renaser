import { TherapyCard } from "../components/TherapyCard";
import { SectionHeading } from "../components/SectionHeading";
import { FAMILIES, POPUP_EVENT, SITE, THERAPIES } from "../data/content";
import homeStyles from "./Home.module.css";
import styles from "./Therapies.module.css";

export default function Therapies() {
  return (
    <section className={homeStyles.section} style={{ paddingTop: 64 }}>
      <div className="container">
        <SectionHeading
          eyebrow="Terapias"
          title="Terapias Holísticas"
          description="Explora las distintas modalidades y elige la que mejor acompañe tu momento actual."
        />

        {POPUP_EVENT.active && (
          <p className={homeStyles.popupNote}>
            📍 Sesiones en <strong>{POPUP_EVENT.city}</strong>: {POPUP_EVENT.dateRange}. {POPUP_EVENT.note}
          </p>
        )}

        {FAMILIES.map((family) => {
          const familyTherapies = THERAPIES.filter((t) => t.family === family.key);
          if (familyTherapies.length === 0) return null;

          return (
            <div key={family.key} id={family.key} className={styles.familyGroup}>
              <h2 className={styles.familyTitle}>{family.name}</h2>
              <div className={homeStyles.grid}>
                {familyTherapies.map((therapy) => (
                  <TherapyCard key={therapy.id} therapy={therapy} />
                ))}
              </div>
            </div>
          );
        })}

        <p className={homeStyles.note}>
          ¿Prefieres coordinar directamente? Escríbenos a {SITE.email} o llámanos al {SITE.phone}.
        </p>
      </div>
    </section>
  );
}
