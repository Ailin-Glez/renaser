import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TherapyCard } from "../components/TherapyCard";
import { SectionHeading } from "../components/SectionHeading";
import { LocationPicker } from "../components/LocationPicker";
import {
  CANCELLATION_POLICY,
  FAMILIES,
  LOCATIONS,
  POPUP_EVENT,
  SITE,
  THERAPIES,
  type LocationKey,
} from "../data/content";
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
    <section className={homeStyles.section} style={{ paddingTop: 64, paddingBottom: 24 }}>
      <div className="container">
        <SectionHeading
          eyebrow="Terapias"
          title="Terapias Holísticas"
          description="Elige tu ciudad y descubre la experiencia ideal para ti."
        />

        {!location ? (
          <>
            <LocationPicker value={location} onChange={setLocation} />
            <p className={styles.emptyHint}>👆 Elige una ciudad para ver las terapias disponibles.</p>
          </>
        ) : (
          <div className={styles.locationBar}>
            <span>
              📍 Terapias en <strong>{LOCATIONS.find((l) => l.key === location)?.name}</strong>
            </span>
            <button type="button" className={styles.changeLocation} onClick={() => setLocation(null)}>
              Cambiar ciudad
            </button>
          </div>
        )}

        {location && (
          <>
            {POPUP_EVENT.active && (
              <p className={styles.dateReminder} data-visible={location === "miami"}>
                📍 Sesiones en <strong>Miami</strong> del {POPUP_EVENT.dateRange}. Reserva con antelación.
              </p>
            )}

            {FAMILIES.map((family, index) => {
              const familyTherapies = THERAPIES.filter((t) => t.family === family.key && t.pricing[location]);
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

            <p className={styles.policyNote}>
              🔒 {CANCELLATION_POLICY.shortNote}{" "}
              <Link to="/preguntas-frecuentes">Ver política completa</Link>
            </p>

            <div className={styles.contactNote}>
              <span className={styles.contactIcon} aria-hidden="true">
                💬
              </span>
              <div>
                <p className={styles.contactTitle}>¿Prefieres coordinar directamente?</p>
                <p className={styles.contactLinks}>
                  <a href={`https://wa.me/${SITE.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    Escríbenos por WhatsApp
                  </a>
                  <span aria-hidden="true">·</span>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
