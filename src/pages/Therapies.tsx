import { useEffect, useRef, useState } from "react";
import { TherapyCard } from "../components/TherapyCard";
import { SectionHeading } from "../components/SectionHeading";
import { LocationPicker } from "../components/LocationPicker";
import { FAMILIES, POPUP_EVENT, SITE, THERAPIES, type LocationKey } from "../data/content";
import homeStyles from "./Home.module.css";
import styles from "./Therapies.module.css";

export default function Therapies() {
  const [location, setLocation] = useState<LocationKey | null>(null);
  const firstFamilyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location) {
      firstFamilyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  return (
    <section className={homeStyles.section} style={{ paddingTop: 64 }}>
      <div className="container">
        <SectionHeading
          eyebrow="Terapias"
          title="Terapias Holísticas"
          description="Elige tu ciudad y descubre la experiencia ideal para ti."
        />

        <LocationPicker value={location} onChange={setLocation} />

        {!location && (
          <p className={styles.emptyHint}>👆 Elige una ciudad para ver las terapias disponibles.</p>
        )}

        {location && (
          <>
            {POPUP_EVENT.active && (
              <p className={styles.dateReminder} data-visible={location === "miami"}>
                📍 Sesiones en <strong>Miami</strong> del {POPUP_EVENT.dateRange}. Reserva con antelación.
              </p>
            )}

            {FAMILIES.map((family, index) => {
              const familyTherapies = THERAPIES.filter((t) => t.family === family.key);
              if (familyTherapies.length === 0) return null;

              return (
                <div
                  key={family.key}
                  id={family.key}
                  ref={index === 0 ? firstFamilyRef : undefined}
                  className={styles.familyGroup}
                >
                  <h2 className={styles.familyTitle}>{family.name}</h2>
                  <div className={homeStyles.grid}>
                    {familyTherapies.map((therapy) => (
                      <TherapyCard key={therapy.id} therapy={therapy} location={location} />
                    ))}
                  </div>
                </div>
              );
            })}

            <p className={homeStyles.note}>
              ¿Prefieres coordinar directamente? Escríbenos a {SITE.email} o llámanos al {SITE.phone}.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
